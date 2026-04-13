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
const createOrder = async (req, res, next) => {
  try {
    const { mentorId, slot } = req.body;
    if (!mentorId || !slot) {
      return res.status(400).json(errorResponse('mentorId and slot are required.'));
    }

    const mentor = await Mentor.findById(mentorId);
    if (!mentor) return res.status(404).json(errorResponse('Mentor not found.'));
    if (!mentor.isAvailable) return res.status(400).json(errorResponse('Mentor is not available.'));

    const conflicts = await MentorBooking.find({
      mentor_id: mentorId,
      statuses: ['pending_payment', 'confirmed'],
    });
    const conflict = conflicts.find(b => b.slot.date === slot.date && b.slot.time === slot.time);
    if (conflict) return res.status(409).json(errorResponse('This slot is already booked.'));

    const amount = (mentor.sessionPrice || 50) * 100;
    let order = {
      id: `mock_order_${uuidv4()}`,
      amount,
      currency: 'INR',
      receipt: `booking_${uuidv4().slice(0, 12)}`,
    };

    if (razorpay) {
      order = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: order.receipt,
        notes: {
          studentId: String(req.user._id || req.user.id),
          mentorId: String(mentorId),
          slotDate: slot.date,
          slotTime: slot.time,
        },
      });
    }

    const userId = req.user._id || req.user.id;
    const booking = await MentorBooking.create({
      student_id: userId,
      mentor_id: mentorId,
      slot_date: slot.date || slot,
      slot_time: slot.time || '',
      razorpay_order_id: order.id,
      amount_paid: amount,
      status: 'pending_payment',
    });

    res.status(201).json(successResponse('Order created.', {
      order: { id: order.id, amount: order.amount, currency: order.currency, receipt: order.receipt },
      bookingId: booking._id,
      keyId: process.env.RAZORPAY_KEY_ID,
    }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/payments/verify ────────────────────────────────────────────
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json(errorResponse('Missing Razorpay payment details.'));
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json(errorResponse('Payment verification failed. Invalid signature.'));
    }

    const userId = req.user._id || req.user.id;
    const booking = await MentorBooking.updateById(bookingId, {
      razorpay_payment_id,
      razorpay_signature,
      status: 'confirmed',
    });

    if (!booking) return res.status(404).json(errorResponse('Booking not found.'));

    if (booking.mentorId?.fcmToken) {
      await notificationService.sendToTokens(
        [booking.mentorId.fcmToken],
        'New Session Booked!',
        `${req.user.name} has booked a session on ${booking.slot.date} at ${booking.slot.time}.`
      ).catch(() => {});
    }

    return res.json(successResponse('Payment verified and booking confirmed.', { booking }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/payments/webhook ───────────────────────────────────────────
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
      const allBookings = await MentorBooking.find({});
      const booking = allBookings.find(b => b.razorpayOrderId === orderId);
      if (booking) {
        await MentorBooking.updateById(booking.id, { status: 'confirmed', razorpay_payment_id: payload.payment.entity.id });
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, verifyPayment, handleWebhook };
