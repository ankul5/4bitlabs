const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: mongoose.Schema.Types.ObjectId,
  selectedAnswer: String,   // e.g. 'A'
  correctAnswer: String,
  isCorrect: Boolean,
  pointsEarned: Number,
});

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    answers: [answerSchema],
    score: { type: Number, default: 0 },          // number of correct answers
    totalPoints: { type: Number, default: 0 },    // points earned (score * points per question)
    maxPoints: { type: Number, default: 0 },      // max achievable points for this quiz
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    timeTakenSeconds: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
    attemptNumber: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Compound index — one attempt record per user per quiz per attempt number
quizAttemptSchema.index({ userId: 1, quizId: 1, attemptNumber: 1 }, { unique: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
