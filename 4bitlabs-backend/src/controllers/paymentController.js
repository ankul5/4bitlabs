const crypto = require('crypto');
const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');
const MentorBooking = require('../models/MentorBooking');
const Mentor = require('../models/Mentor');
const notificationService = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// ─── POST /api/v1/payments/create-order ──────────────────────────────────────
// Creates a Razorpay order for ₹50 mentor session
const createOrder = async (req, res, next) => {
  try {
    const { mentorId, slot } = req.body;
    if (!mentorId || !slot) {
      return res.status(400).json(errorResponse('mentorId and slot are required.'));
    }

    const mentor = await Mentor.findById(mentorId);
    if (!mentor) return res.status(404).json(errorResponse('Mentor not found.'));
    if (!mentor.isAvailable) return res.status(400).json(errorResponse('Mentor is not available for booking.'));

    // Check for existing confirmed booking at the same slot
    const conflict = await MentorBooking.findOne({
      mentorId,
      'slot.date': slot.date,
      'slot.time': slot.time,
      status: { $in: ['pending_payment', 'confirmed'] },
    });
    if (conflict) return res.status(409).json(errorResponse('This slot is already booked. Please choose another time.'));

    // Amount in paise (₹50 = 5000 paise)
    const amount = (mentor.sessionPrice || 50) * 100;

    let order = {
      id: `mock_order_${uuidv4()}`,
      amount,
      currency: 'INR',
      receipt: `booking_${uuidv4().slice(0, 12)}`
    };

    if (razorpay) {
      order = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: `booking_${uuidv4().slice(0, 12)}`,
        notes: {
          studentId: String(req.user._id),
          mentorId: String(mentorId),
          slotDate: slot.date,
          slotTime: slot.time,
        },
      });
    }

    // Create a pending booking record
    const booking = await MentorBooking.create({
      studentId: req.user._id,
      mentorId,
      slot,
      razorpayOrderId: order.id,
      amountPaid: amount,
      status: 'pending_payment',
    });

    res.status(201).json(
      successResponse('Order created.', {
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
        },
        bookingId: booking._id,
        keyId: process.env.RAZORPAY_KEY_ID,
      })
    );
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/payments/verify ────────────────────────────────────────────
// Verify Razorpay payment signature and confirm booking
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json(errorResponse('Missing Razorpay payment details.'));
    }

    // ─── Verify HMAC Signature ─────────────────────────────────────────────
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json(errorResponse('Payment verification failed. Invalid signature.'));
    }

    // ─── Update Booking Status ─────────────────────────────────────────────
    const booking = await MentorBooking.findOneAndUpdate(
      { _id: bookingId, studentId: req.user._id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'confirmed',
      },
      { new: true }
    ).populate('mentorId', 'name fcmToken');

    if (!booking) return res.status(404).json(errorResponse('Booking not found.'));

    // ─── Notify Mentor via FCM ─────────────────────────────────────────────
    if (booking.mentorId?.fcmToken) {
      await notificationService.sendToTokens(
        [booking.mentorId.fcmToken],
        'New Session Booked! 📅',
        `${req.user.name} has booked a session on ${booking.slot.date} at ${booking.slot.time}.`
      ).catch(() => {});
    }

    // ─── Notify Student ────────────────────────────────────────────────────
    if (req.user.fcmTokens?.length > 0) {
      await notificationService.sendToTokens(
        req.user.fcmTokens,
        'Booking Confirmed! 🎉',
        `Your session with ${booking.mentorId?.name} on ${booking.slot.date} at ${booking.slot.time} is confirmed.`
      ).catch(() => {});
    }

    return res.json(successResponse('Payment verified and booking confirmed.', { booking }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/payments/webhook ───────────────────────────────────────────
// Razorpay webhook for production — validates webhook signature
const handleWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) return res.status(200).json({ received: true });

    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    const expected = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');

    if (signature !== expected) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    const { event, payload } = req.body;
    if (event === 'payment.captured') {
      const orderId = payload.payment.entity.order_id;
      await MentorBooking.findOneAndUpdate(
        { razorpayOrderId: orderId },
        { status: 'confirmed', razorpayPaymentId: payload.payment.entity.id }
      );
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, verifyPayment, handleWebhook };
