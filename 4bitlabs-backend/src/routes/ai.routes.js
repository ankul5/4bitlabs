const express = require('express');
const { generateQuiz, generateQuestionsPreview } = require('../controllers/aiQuizController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// POST /api/v1/ai/generate-quiz — Generate full quiz and save to DB (draft)
router.post(
  '/generate-quiz',
  protect,
  authorize('teacher', 'school_admin', 'super_admin'),
  generateQuiz
);

// POST /api/v1/ai/generate-questions — Preview generated questions (no save)
router.post(
  '/generate-questions',
  protect,
  authorize('teacher', 'school_admin', 'super_admin'),
  generateQuestionsPreview
);

module.exports = router;
