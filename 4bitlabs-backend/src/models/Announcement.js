const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ['general', 'quiz', 'course', 'event', 'maintenance', 'urgent'],
      default: 'general',
    },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    isPinned: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
    targetRoles: [{ type: String, enum: ['student', 'mentor', 'teacher', 'school_admin', 'super_admin'] }],
  },
  { timestamps: true }
);

// Auto-expire announcements
announcementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
announcementSchema.index({ schoolId: 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
