const { generateQuizQuestions, generateQuizMeta } = require('../services/geminiService');
const Quiz = require('../models/Quiz');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// ─── POST /api/v1/ai/generate-quiz — AI generates a full quiz ───────────────
/**
 * Teacher/admin sends a topic + count + difficulty → Gemini generates questions
 * → quiz is created in the database automatically.
 *
 * Body: { topic, courseId, schoolId, count?, difficulty?, duration? }
 */
const generateQuiz = async (req, res, next) => {
  try {
    const {
      topic,
      courseId,
      schoolId,
      count = 5,
      difficulty = 'medium',
      duration = 15,
    } = req.body;

    if (!topic) return res.status(400).json(errorResponse('Topic is required.'));
    if (!courseId) return res.status(400).json(errorResponse('courseId is required.'));

    // Clamp count to a safe range
    const questionCount = Math.min(Math.max(parseInt(count) || 5, 1), 20);

    // 1. Generate questions via Gemini
    const questions = await generateQuizQuestions(topic, questionCount, difficulty);

    // 2. Generate title & description
    const meta = await generateQuizMeta(topic, difficulty);

    // 3. Calculate total marks
    const totalMarks = questions.reduce((sum, q) => sum + q.points, 0);
    const passingMarks = Math.round(totalMarks * 0.6); // 60% to pass

    // 4. Create quiz in database
    const quiz = await Quiz.create({
      title: meta.title,
      description: meta.description,
      courseId,
      schoolId: schoolId || req.user.schoolId,
      createdBy: req.user._id,
      duration: parseInt(duration) || 15,
      totalMarks,
      passingMarks,
      status: 'draft', // Teacher can review before publishing
      shuffleQuestions: true,
      shuffleOptions: false,
      attemptLimit: 2,
      questions,
      category: topic,
    });

    res.status(201).json(
      successResponse('AI quiz generated successfully! Review and publish when ready.', {
        quiz,
        aiMeta: {
          topic,
          difficulty,
          questionsGenerated: questions.length,
          model: 'gemini-2.0-flash',
        },
      })
    );
  } catch (error) {
    if (error.message.includes('GEMINI_API_KEY')) {
      return res.status(503).json(errorResponse(error.message));
    }
    if (error.message.includes('invalid JSON') || error.message.includes('invalid question')) {
      return res.status(502).json(errorResponse('AI generation failed. Please try again.'));
    }
    next(error);
  }
};

// ─── POST /api/v1/ai/generate-questions — Generate questions only (no save) ─
/**
 * Preview questions without saving to database.
 * Useful for teachers who want to review/edit before creating a quiz.
 *
 * Body: { topic, count?, difficulty? }
 */
const generateQuestionsPreview = async (req, res, next) => {
  try {
    const { topic, count = 5, difficulty = 'medium' } = req.body;

    if (!topic) return res.status(400).json(errorResponse('Topic is required.'));

    const questionCount = Math.min(Math.max(parseInt(count) || 5, 1), 20);
    const questions = await generateQuizQuestions(topic, questionCount, difficulty);
    const meta = await generateQuizMeta(topic, difficulty);

    res.json(
      successResponse('Questions generated successfully.', {
        title: meta.title,
        description: meta.description,
        questions,
        difficulty,
        totalPoints: questions.reduce((s, q) => s + q.points, 0),
      })
    );
  } catch (error) {
    if (error.message.includes('GEMINI_API_KEY')) {
      return res.status(503).json(errorResponse(error.message));
    }
    next(error);
  }
};

module.exports = { generateQuiz, generateQuestionsPreview };
