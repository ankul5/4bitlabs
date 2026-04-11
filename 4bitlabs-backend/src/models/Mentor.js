const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    uid: { type: String, required: true }, // Firebase UID
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
    role: { type: String, required: true, default: 'Mentor' },
    bio: { type: String, default: '' },
    skills: [{ type: String }],
    experience: { type: String, default: '' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    sessionPrice: { type: Number, default: 50 }, // in INR
    isVerified: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    availableSlots: [
      {
        day: String,     // 'Monday', 'Tuesday', etc.
        times: [String], // ['09:00 AM', '11:30 AM']
      },
    ],
    totalSessionsCompleted: { type: Number, default: 0 },
    fcmToken: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mentor', mentorSchema);
