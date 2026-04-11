const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped', 'paused'],
      default: 'active',
    },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    progress: { type: Number, default: 0, min: 0, max: 100 }, // percentage
    completedLectures: [{ type: mongoose.Schema.Types.ObjectId }], // lecture subdoc IDs
    lastAccessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One enrollment per user per course
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
