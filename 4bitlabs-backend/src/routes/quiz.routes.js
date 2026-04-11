const express = require('express');
const {
  getQuizzes, getQuiz, submitQuiz, createQuiz, updateQuiz, addManualPoints,
  deleteQuiz, getQuizAttempts,
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  createQuizValidation, submitQuizValidation, addManualPointsValidation, validate,
} = require('../middleware/validators');

const router = express.Router();

// GET  /api/v1/quizzes?courseId=xxx  — List quizzes with attempt status
router.get('/', protect, getQuizzes);

// GET  /api/v1/quizzes/:id           — Get quiz (no correct answers)
router.get('/:id', protect, getQuiz);

// POST /api/v1/quizzes/:id/submit    — Submit answers → auto-grade
router.post('/:id/submit', protect, submitQuizValidation, validate, submitQuiz);

// GET  /api/v1/quizzes/:id/attempts  — Teacher views all attempts
router.get('/:id/attempts', protect, authorize('teacher', 'school_admin', 'super_admin'), getQuizAttempts);

// POST /api/v1/quizzes               — Teacher creates quiz
router.post('/', protect, authorize('teacher', 'school_admin', 'super_admin'), createQuizValidation, validate, createQuiz);

// PUT  /api/v1/quizzes/:id           — Teacher updates quiz
router.put('/:id', protect, authorize('teacher', 'school_admin', 'super_admin'), updateQuiz);

// DELETE /api/v1/quizzes/:id         — Teacher deletes quiz
router.delete('/:id', protect, authorize('teacher', 'school_admin', 'super_admin'), deleteQuiz);

// POST /api/v1/quizzes/add-points    — Teacher manually adds points
router.post('/add-points', protect, authorize('teacher', 'school_admin', 'super_admin'), addManualPointsValidation, validate, addManualPoints);

module.exports = router;
