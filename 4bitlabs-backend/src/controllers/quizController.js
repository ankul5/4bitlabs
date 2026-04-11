const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Helper: shuffle array (Fisher-Yates)
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ─── GET /api/v1/quizzes?courseId=xxx ────────────────────────────────────────
const getQuizzes = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    const filter = { status: 'published' };
    if (courseId) filter.courseId = courseId;
    else filter.schoolId = req.user.schoolId;

    const quizzes = await Quiz.find(filter)
      .select('title category duration totalMarks attemptLimit availableFrom availableTo createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Attach attempt status for the current user
    const quizIds = quizzes.map((q) => q._id);
    const attempts = await QuizAttempt.find({
      userId: req.user._id,
      quizId: { $in: quizIds },
    }).select('quizId score totalPoints percentage passed attemptNumber').lean();

    const attemptMap = {};
    attempts.forEach((a) => {
      attemptMap[String(a.quizId)] = a;
    });

    const enriched = quizzes.map((q) => ({
      ...q,
      attempt: attemptMap[String(q._id)] || null,
      status: attemptMap[String(q._id)]
        ? attemptMap[String(q._id)].passed ? 'completed' : 'failed'
        : 'available',
    }));

    res.json(successResponse('Quizzes fetched.', { quizzes: enriched, count: enriched.length }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/quizzes/:id ─────────────────────────────────────────────────
// Returns quiz WITHOUT correct answers (hidden for security)
const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();
    if (!quiz) return res.status(404).json(errorResponse('Quiz not found.'));

    // Check attempt limit
    const attemptCount = await QuizAttempt.countDocuments({
      userId: req.user._id,
      quizId: quiz._id,
    });
    if (attemptCount >= quiz.attemptLimit) {
      return res.status(403).json(errorResponse(`You have used all ${quiz.attemptLimit} attempt(s) for this quiz.`));
    }

    // Shuffle & strip correct answers from questions before sending
    let questions = quiz.shuffleQuestions ? shuffle(quiz.questions) : quiz.questions;
    questions = questions.map((q) => {
      const opts = quiz.shuffleOptions ? shuffle(q.options) : q.options;
      return {
        _id: q._id,
        question: q.question,
        imageUrl: q.imageUrl,
        options: opts,
        points: q.points,
        // correctAnswer intentionally omitted
      };
    });

    res.json(successResponse('Quiz fetched.', { quiz: { ...quiz, questions } }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/quizzes/:id/submit ─────────────────────────────────────────
// Auto-grade, award points, update leaderboard, emit Socket.IO event
const submitQuiz = async (req, res, next) => {
  try {
    const { answers, timeTakenSeconds } = req.body;
    // answers: [{ questionId, selectedAnswer }]

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json(errorResponse('Quiz not found.'));

    // Check attempt limit
    const attemptCount = await QuizAttempt.countDocuments({
      userId: req.user._id,
      quizId: quiz._id,
    });
    if (attemptCount >= quiz.attemptLimit) {
      return res.status(403).json(errorResponse('Attempt limit reached for this quiz.'));
    }

    // ─── Auto-grade ─────────────────────────────────────────────────────────
    const questionMap = {};
    quiz.questions.forEach((q) => { questionMap[String(q._id)] = q; });

    let totalPoints = 0;
    let correctCount = 0;
    const gradedAnswers = answers.map((ans) => {
      const q = questionMap[ans.questionId];
      if (!q) return { questionId: ans.questionId, selectedAnswer: ans.selectedAnswer, isCorrect: false, pointsEarned: 0 };
      const isCorrect = q.correctAnswer === ans.selectedAnswer;
      const pointsEarned = isCorrect ? q.points : 0;
      if (isCorrect) correctCount++;
      totalPoints += pointsEarned;
      return {
        questionId: ans.questionId,
        selectedAnswer: ans.selectedAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        pointsEarned,
      };
    });

    const maxPoints = quiz.questions.reduce((s, q) => s + q.points, 0);
    const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    const passed = totalPoints >= quiz.passingMarks;

    // ─── Save attempt ────────────────────────────────────────────────────────
    const attempt = await QuizAttempt.create({
      userId: req.user._id,
      quizId: quiz._id,
      courseId: quiz.courseId,
      schoolId: quiz.schoolId,
      answers: gradedAnswers,
      score: correctCount,
      totalPoints,
      maxPoints,
      percentage,
      passed,
      timeTakenSeconds: timeTakenSeconds || 0,
      attemptNumber: attemptCount + 1,
    });

    // ─── Award points to user ─────────────────────────────────────────────────
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: totalPoints } });

    // ─── Update Leaderboard ─────────────────────────────────────────────────
    let leaderboard = await Leaderboard.findOne({ courseId: quiz.courseId });
    if (!leaderboard) {
      leaderboard = await Leaderboard.create({
        courseId: quiz.courseId,
        schoolId: quiz.schoolId,
        entries: [],
      });
    }

    const entryIdx = leaderboard.entries.findIndex((e) => String(e.userId) === String(req.user._id));
    if (entryIdx > -1) {
      leaderboard.entries[entryIdx].points += totalPoints;
      leaderboard.entries[entryIdx].quizzesCompleted += 1;
      leaderboard.entries[entryIdx].lastUpdated = new Date();
    } else {
      leaderboard.entries.push({
        userId: req.user._id,
        uid: req.user.uid,
        name: req.user.name,
        avatar: req.user.avatar,
        schoolName: req.user.schoolId?.name || '',
        points: totalPoints,
        quizzesCompleted: 1,
      });
    }
    leaderboard.recalculateRanks();
    await leaderboard.save();

    // ─── Emit real-time leaderboard update ────────────────────────────────────
    if (req.io) {
      req.io.to(`leaderboard_${quiz.courseId}`).emit('leaderboard:update', {
        userId: req.user._id,
        name: req.user.name,
        points: totalPoints,
        totalPoints: (leaderboard.entries.find((e) => String(e.userId) === String(req.user._id)) || {}).points,
      });
    }

    // ─── Push notification to student ────────────────────────────────────────
    if (req.user.fcmTokens?.length > 0) {
      await notificationService.sendToTokens(
        req.user.fcmTokens,
        'Quiz Complete! 🎓',
        `You scored ${percentage}% and earned ${totalPoints} points.`
      ).catch(() => {}); // Don't fail the request if FCM fails
    }

    return res.json(
      successResponse('Quiz submitted successfully.', {
        attempt: {
          score: correctCount,
          totalQuestions: quiz.questions.length,
          totalPoints,
          maxPoints,
          percentage,
          passed,
          answers: gradedAnswers,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/quizzes — teacher/admin — Create Quiz ─────────────────────
const createQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.create({ ...req.body, createdBy: req.user._id });
    // Notify enrolled students via FCM
    notificationService.notifySchool(
      quiz.schoolId,
      'New Quiz Available! 📝',
      `A new quiz "${quiz.title}" is now available. Test your knowledge!`
    ).catch(() => {});
    res.status(201).json(successResponse('Quiz created.', { quiz }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/quizzes/:id — teacher/admin — Update Quiz ──────────────────
const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!quiz) return res.status(404).json(errorResponse('Quiz not found.'));
    res.json(successResponse('Quiz updated.', { quiz }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/quizzes/add-points — teacher manually adds points ──────────
const addManualPoints = async (req, res, next) => {
  try {
    const { studentId, courseId, points, reason } = req.body;
    if (!studentId || !courseId || !points) {
      return res.status(400).json(errorResponse('studentId, courseId, and points are required.'));
    }

    const student = await User.findByIdAndUpdate(studentId, { $inc: { points } }, { new: true });
    if (!student) return res.status(404).json(errorResponse('Student not found.'));

    // Update leaderboard
    let lb = await Leaderboard.findOne({ courseId });
    if (lb) {
      const idx = lb.entries.findIndex((e) => String(e.userId) === String(studentId));
      if (idx > -1) {
        lb.entries[idx].points += points;
      } else {
        lb.entries.push({ userId: studentId, name: student.name, avatar: student.avatar, points });
      }
      lb.recalculateRanks();
      await lb.save();
      if (req.io) req.io.to(`leaderboard_${courseId}`).emit('leaderboard:update', { userId: studentId, points });
    }

    res.json(successResponse(`${points} points added to ${student.name}.`, { student: { name: student.name, points: student.points } }));
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/quizzes/:id — teacher/admin — Delete Quiz ────────────────
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json(errorResponse('Quiz not found.'));
    // Also remove all quiz attempts
    await QuizAttempt.deleteMany({ quizId: quiz._id });
    res.json(successResponse('Quiz and all attempts deleted.'));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/quizzes/:id/attempts — teacher views all attempts ──────────
const getQuizAttempts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { quizId: req.params.id };
    const total = await QuizAttempt.countDocuments(filter);
    const attempts = await QuizAttempt.find(filter)
      .populate('userId', 'name email avatar')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json(successResponse('Quiz attempts fetched.', {
      attempts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getQuizzes, getQuiz, submitQuiz, createQuiz, updateQuiz, addManualPoints, deleteQuiz, getQuizAttempts };
