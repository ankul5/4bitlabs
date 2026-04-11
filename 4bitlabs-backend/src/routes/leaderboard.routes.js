const express = require('express');
const { getLeaderboard, getMyRanks } = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/v1/leaderboard/my-ranks           — My rank across all courses
router.get('/my-ranks', protect, getMyRanks);

// GET /api/v1/leaderboard/:courseId          — Paginated leaderboard for a course
router.get('/:courseId', protect, getLeaderboard);

module.exports = router;
