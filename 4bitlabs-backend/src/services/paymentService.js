const Razorpay = require('razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order.
 * @param {number} amountINR - Amount in Indian Rupees (e.g., 50 for ₹50)
 * @param {object} notes - Additional notes for the order
 */
const createOrder = async (amountINR, notes = {}) => {
  const order = await razorpay.orders.create({
    amount: amountINR * 100, // Convert to paise
    currency: 'INR',
    receipt: `rcpt_${uuidv4().slice(0, 12)}`,
    notes,
  });
  return order;
};

/**
 * Verify the Razorpay payment signature.
 * @param {string} orderId
 * @param {string} paymentId
 * @param {string} signature
 * @returns {boolean}
 */
const verifySignature = (orderId, paymentId, signature) => {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expected === signature;
};

/**
 * Fetch payment details from Razorpay.
 */
const fetchPayment = async (paymentId) => {
  return razorpay.payments.fetch(paymentId);
};

/**
 * Issue a refund.
 */
const refundPayment = async (paymentId, amountINR) => {
  return razorpay.payments.refund(paymentId, { amount: amountINR * 100 });
};

module.exports = { createOrder, verifySignature, fetchPayment, refundPayment };
