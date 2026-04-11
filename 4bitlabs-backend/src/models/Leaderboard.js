const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uid: { type: String },           // Firebase UID for quick lookup
  name: { type: String },
  avatar: { type: String },
  schoolName: { type: String },
  points: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  quizzesCompleted: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

const leaderboardSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, unique: true, index: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    entries: [leaderboardEntrySchema],
    lastRecalculated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Helper: Re-rank all entries by points (descending)
leaderboardSchema.methods.recalculateRanks = function () {
  this.entries.sort((a, b) => b.points - a.points);
  this.entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });
  this.lastRecalculated = new Date();
};

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
