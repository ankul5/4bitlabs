const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ─── GET /api/v1/quizzes ─────────────────────────────────────────────────────
const getQuizzes = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const schoolId = req.user.schoolId?._id || req.user.schoolId;
    const filter = { status: 'published' };
    if (req.query.courseId) filter.course_id = req.query.courseId;
    else if (schoolId) filter.school_id = schoolId;

    const quizzes = await Quiz.find(filter);
    const quizIds = quizzes.map(q => q.id);

    const attempts = quizIds.length > 0
      ? await QuizAttempt.find({ user_id: userId, quiz_ids: quizIds })
      : [];

    const attemptMap = {};
    attempts.forEach(a => { attemptMap[String(a.quizId)] = a; });

    const enriched = quizzes.map(q => ({
      ...q,
      attempt: attemptMap[String(q.id)] || null,
      status: attemptMap[String(q.id)]
        ? (attemptMap[String(q.id)].passed ? 'completed' : 'failed')
        : 'available',
    }));

    res.json(successResponse('Quizzes fetched.', { quizzes: enriched, count: enriched.length }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/quizzes/:id ─────────────────────────────────────────────────
const getQuiz = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json(errorResponse('Quiz not found.'));

    const attemptCount = await QuizAttempt.countDocuments({ user_id: userId, quiz_id: quiz.id });
    if (attemptCount >= quiz.attemptLimit) {
      return res.status(403).json(errorResponse(`You have used all ${quiz.attemptLimit} attempt(s).`));
    }

    let questions = quiz.shuffleQuestions ? shuffle(quiz.questions) : quiz.questions;
    questions = questions.map(q => {
      const opts = quiz.shuffleOptions ? shuffle(q.options) : q.options;
      return { _id: q._id, question: q.question, imageUrl: q.imageUrl, options: opts, points: q.points };
    });

    res.json(successResponse('Quiz fetched.', { quiz: { ...quiz, questions } }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/quizzes/:id/submit ─────────────────────────────────────────
const submitQuiz = async (req, res, next) => {
  try {
    const { answers, timeTakenSeconds } = req.body;
    const userId = req.user._id || req.user.id;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json(errorResponse('Quiz not found.'));

    const attemptCount = await QuizAttempt.countDocuments({ user_id: userId, quiz_id: quiz.id });
    if (attemptCount >= quiz.attemptLimit) {
      return res.status(403).json(errorResponse('Attempt limit reached.'));
    }

    const questionMap = {};
    quiz.questions.forEach(q => { questionMap[String(q._id || q.id)] = q; });

    let totalPoints = 0;
    let correctCount = 0;
    let hasWritten = false;
    
    const gradedAnswers = answers.map(ans => {
      const q = questionMap[ans.questionId];
      if (!q) return { questionId: ans.questionId, selectedAnswer: ans.selectedAnswer, isCorrect: false, pointsEarned: 0 };
      
      let isCorrect = false;
      let pointsEarned = 0;
      
      if (q.type === 'written') {
        hasWritten = true;
        // Text submitted as selectedAnswer or answer_text
        return { questionId: ans.questionId, answer_text: ans.selectedAnswer || ans.answer_text, type: 'written', status: 'pending_review', pointsEarned: 0 };
      } else {
        isCorrect = q.correctAnswer === ans.selectedAnswer;
        pointsEarned = isCorrect ? q.points : 0;
        if (isCorrect) correctCount++;
        totalPoints += pointsEarned;
        return { questionId: ans.questionId, selectedAnswer: ans.selectedAnswer, correctAnswer: q.correctAnswer, isCorrect, pointsEarned, type: 'mcq', status: 'graded' };
      }
    });

    const maxPoints = quiz.questions.reduce((s, q) => s + q.points, 0);
    const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    const passed = hasWritten ? false : totalPoints >= quiz.passingMarks;
    const status = hasWritten ? 'pending_review' : 'completed';

    await QuizAttempt.create({
      user_id: userId, quiz_id: quiz.id, course_id: quiz.courseId, school_id: quiz.schoolId,
      answers: gradedAnswers, score: correctCount, total_points: totalPoints, max_points: maxPoints,
      percentage, passed, time_taken_seconds: timeTakenSeconds || 0, attempt_number: attemptCount + 1,
      status
    });

    if (!hasWritten) {
      await User.incrementPoints(userId, totalPoints);
      await Leaderboard.upsertEntry(quiz.courseId, quiz.schoolId, userId, {
        uid: req.user.uid, name: req.user.name, avatar: req.user.avatar,
        schoolName: req.user.schoolId?.name || '', points: totalPoints,
      });

      if (req.io) {
        req.io.to(`leaderboard_${quiz.courseId}`).emit('leaderboard:update', {
          userId, name: req.user.name, points: totalPoints,
        });
      }

      if (req.user.fcmTokens?.length > 0) {
        await notificationService.sendToTokens(
          req.user.fcmTokens, 'Quiz Complete!',
          `You scored ${percentage}% and earned ${totalPoints} points.`
        ).catch(() => {});
      }
    }

    return res.json(successResponse('Quiz submitted successfully.', {
      attempt: { score: correctCount, totalQuestions: quiz.questions.length, totalPoints, maxPoints, percentage, passed, status, answers: gradedAnswers },
    }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/quizzes — teacher/admin ────────────────────────────────────
const createQuiz = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const quiz = await Quiz.create({ ...req.body, created_by: userId });
    notificationService.notifySchool(quiz.schoolId, 'New Quiz Available!', `"${quiz.title}" is now available.`).catch(() => {});
    res.status(201).json(successResponse('Quiz created.', { quiz }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/quizzes/:id ─────────────────────────────────────────────────
const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body);
    if (!quiz) return res.status(404).json(errorResponse('Quiz not found.'));
    res.json(successResponse('Quiz updated.', { quiz }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/quizzes/add-points ─────────────────────────────────────────
const addManualPoints = async (req, res, next) => {
  try {
    const { studentId, courseId, points } = req.body;
    if (!studentId || !courseId || !points) {
      return res.status(400).json(errorResponse('studentId, courseId, and points are required.'));
    }
    await User.incrementPoints(studentId, points);
    await Leaderboard.addPointsToEntry(courseId, studentId, points);
    if (req.io) req.io.to(`leaderboard_${courseId}`).emit('leaderboard:update', { userId: studentId, points });
    const student = await User.findById(studentId);
    res.json(successResponse(`${points} points added.`, { student: { name: student?.name, points: student?.points } }));
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/quizzes/:id ──────────────────────────────────────────────
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json(errorResponse('Quiz not found.'));
    await QuizAttempt.deleteMany({ quiz_id: quiz.id });
    res.json(successResponse('Quiz and all attempts deleted.'));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/quizzes/:id/attempts ────────────────────────────────────────
const getQuizAttempts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const total = await QuizAttempt.countDocuments({ quiz_id: req.params.id });
    const attempts = await QuizAttempt.find({ quiz_id: req.params.id, limit, offset });
    res.json(successResponse('Quiz attempts fetched.', { attempts, total, page, totalPages: Math.ceil(total / limit) }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/quizzes/attempts/:id/grade ────────────────────────────────
const gradeAttempt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { grades } = req.body; // Array of { questionId, pointsAwarded }

    const { pool } = require('../config/database');
    const { rows } = await pool.query('SELECT * FROM quiz_attempts WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json(errorResponse('Attempt not found.'));
    const attempt = rows[0];

    if (attempt.status === 'completed') {
      return res.status(400).json(errorResponse('This attempt is already graded.'));
    }

    let answers = attempt.answers;
    if (typeof answers === 'string') answers = JSON.parse(answers);

    let additionalPoints = 0;
    
    // Process the manual grades
    answers = answers.map(ans => {
      if (ans.type === 'written' && ans.status === 'pending_review') {
        const gradeInfo = grades.find(g => g.questionId === ans.questionId);
        if (gradeInfo) {
          ans.pointsEarned = gradeInfo.pointsAwarded || 0;
          ans.status = 'graded';
          additionalPoints += ans.pointsEarned;
        }
      }
      return ans;
    });

    const isFullyGraded = !answers.some(a => a.type === 'written' && a.status === 'pending_review');
    const newTotalPoints = attempt.total_points + additionalPoints;
    const newPercentage = attempt.max_points > 0 ? Math.round((newTotalPoints / attempt.max_points) * 100) : 0;
    // We need to fetch passingMarks
    const quizRes = await pool.query('SELECT passing_marks FROM quizzes WHERE id = $1', [attempt.quiz_id]);
    const passingMarks = quizRes.rows[0]?.passing_marks || 0;
    const newPassed = newTotalPoints >= passingMarks;

    const newStatus = isFullyGraded ? 'completed' : 'pending_review';

    await pool.query(
      `UPDATE quiz_attempts SET answers = $1, total_points = $2, percentage = $3, passed = $4, status = $5 WHERE id = $6`,
      [JSON.stringify(answers), newTotalPoints, newPercentage, newPassed, newStatus, id]
    );

    if (isFullyGraded) {
      await User.incrementPoints(attempt.user_id, newTotalPoints);
      
      const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [attempt.user_id]);
      const u = userRes.rows[0];

      await Leaderboard.upsertEntry(attempt.course_id, attempt.school_id, attempt.user_id, {
        uid: u.uid, name: u.name, avatar: u.avatar || '',
        schoolName: '', points: newTotalPoints,
      });

      if (req.io) {
        req.io.to(`leaderboard_${attempt.course_id}`).emit('leaderboard:update', {
          userId: attempt.user_id, name: u.name, points: newTotalPoints,
        });
      }
    }

    res.json(successResponse('Graded successfully.', { isFullyGraded, totalPoints: newTotalPoints }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getQuizzes, getQuiz, submitQuiz, createQuiz, updateQuiz, addManualPoints, deleteQuiz, getQuizAttempts, gradeAttempt };
