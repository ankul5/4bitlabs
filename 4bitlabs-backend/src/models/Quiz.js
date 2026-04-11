const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  key: { type: String, required: true }, // 'A', 'B', 'C', 'D'
  text: { type: String, required: true },
});

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [optionSchema], required: true },
  correctAnswer: { type: String, required: true }, // 'A', 'B', 'C', or 'D'
  explanation: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  points: { type: Number, default: 10 }, // per-question point value
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // teacher
    questions: { type: [questionSchema], required: true },
    duration: { type: Number, required: true, default: 15 }, // minutes
    totalMarks: { type: Number, default: 0 },
    passingMarks: { type: Number, default: 0 },
    category: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft',
    },
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
    showResultsImmediately: { type: Boolean, default: true },
    attemptLimit: { type: Number, default: 1 }, // max attempts per student
    availableFrom: { type: Date },
    availableTo: { type: Date },
  },
  { timestamps: true }
);

// Auto-compute totalMarks before save
quizSchema.pre('save', function (next) {
  this.totalMarks = this.questions.reduce((sum, q) => sum + q.points, 0);
  this.passingMarks = Math.ceil(this.totalMarks * 0.6);
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);
