const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lectureId: { type: mongoose.Schema.Types.ObjectId, required: true }, // subdoc ID from Course.lectures
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    date: { type: String, required: true }, // ISO date string 'YYYY-MM-DD'
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      default: 'present',
    },
    watchedDurationSeconds: { type: Number, default: 0 },
    markedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same user+lecture
attendanceSchema.index({ userId: 1, lectureId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
