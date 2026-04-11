const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true, index: true }, // Firebase UID
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['student', 'mentor', 'teacher', 'school_admin', 'super_admin'],
      default: 'student',
    },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
    courseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    // Gamification
    points: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    // FCM
    fcmTokens: [{ type: String }],
    // Status
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Virtual: full profile
userSchema.virtual('profileUrl').get(function () {
  return this.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=ba0013&color=fff&size=128`;
});

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
