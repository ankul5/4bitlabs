const Leaderboard = require('../models/Leaderboard');
const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// ─── GET /api/v1/leaderboard/:courseId ───────────────────────────────────────
const getLeaderboard = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { rows: allEntries } = await pool.query(
      'SELECT * FROM leaderboard_entries WHERE course_id = $1 ORDER BY points DESC',
      [courseId]
    );

    if (allEntries.length === 0) {
      return res.json(successResponse('No leaderboard data yet.', { entries: [], total: 0, currentUserRank: null }));
    }

    const total = allEntries.length;
    const entries = allEntries.slice(offset, offset + limit).map(r => ({
      _id: r.id, userId: r.user_id, name: r.name, avatar: r.avatar, points: r.points, rank: r.rank, quizzesCompleted: r.quizzes_completed,
    }));

    const userId = req.user._id || req.user.id;
    const currentUserEntry = allEntries.find(e => String(e.user_id) === String(userId));

    res.json(successResponse('Leaderboard fetched.', {
      entries, total, page,
      totalPages: Math.ceil(total / limit),
      currentUserRank: currentUserEntry ? { rank: currentUserEntry.rank, points: currentUserEntry.points } : null,
    }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/leaderboard/my-ranks ────────────────────────────────────────
const getMyRanks = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { rows } = await pool.query(
      `SELECT le.*, c.title as course_title FROM leaderboard_entries le LEFT JOIN courses c ON le.course_id = c.id WHERE le.user_id = $1`,
      [userId]
    );
    const ranks = rows.map(r => ({
      courseId: r.course_id, courseTitle: r.course_title,
      rank: r.rank || '-', points: r.points || 0,
    }));
    res.json(successResponse('My ranks fetched.', { ranks }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaderboard, getMyRanks };
