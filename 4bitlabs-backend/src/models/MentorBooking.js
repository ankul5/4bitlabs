const mongoose = require('mongoose');

const mentorBookingSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true, index: true },
    slot: {
      date: { type: String, required: true }, // '2024-12-25'
      time: { type: String, required: true }, // '02:00 PM'
    },
    // Razorpay fields
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    amountPaid: { type: Number, required: true, default: 5000 }, // paise
    currency: { type: String, default: 'INR' },
    // Booking status
    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'completed', 'cancelled', 'refunded'],
      default: 'pending_payment',
    },
    notes: { type: String, default: '' },
    meetingLink: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MentorBooking', mentorBookingSchema);
