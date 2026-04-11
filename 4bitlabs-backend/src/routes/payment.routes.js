const express = require('express');
const { createOrder, verifyPayment, handleWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { createOrderValidation, verifyPaymentValidation, validate } = require('../middleware/validators');

const router = express.Router();

// POST /api/v1/payments/create-order  — Create Razorpay order (₹50)
router.post('/create-order', protect, createOrderValidation, validate, createOrder);

// POST /api/v1/payments/verify        — Verify payment signature + confirm booking
router.post('/verify', protect, verifyPaymentValidation, validate, verifyPayment);

// POST /api/v1/payments/webhook       — Razorpay webhook (no auth, uses webhook secret)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
