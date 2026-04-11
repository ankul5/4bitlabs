const Leaderboard = require('../models/Leaderboard');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// ─── GET /api/v1/leaderboard/:courseId ───────────────────────────────────────
const getLeaderboard = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const leaderboard = await Leaderboard.findOne({ courseId }).lean();
    if (!leaderboard) {
      return res.json(successResponse('No leaderboard data yet.', { entries: [], total: 0, currentUserRank: null }));
    }

    const total = leaderboard.entries.length;
    const entries = leaderboard.entries.slice(skip, skip + limit);

    // Find current user's rank
    const currentUserEntry = leaderboard.entries.find(
      (e) => String(e.userId) === String(req.user._id)
    );

    res.json(
      successResponse('Leaderboard fetched.', {
        entries,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        currentUserRank: currentUserEntry || null,
        lastRecalculated: leaderboard.lastRecalculated,
      })
    );
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/leaderboard/my-ranks ────────────────────────────────────────
// Returns the current user's rank across all enrolled courses
const getMyRanks = async (req, res, next) => {
  try {
    const leaderboards = await Leaderboard.find({
      courseId: { $in: req.user.courseIds },
      'entries.userId': req.user._id,
    }).populate('courseId', 'title').lean();

    const ranks = leaderboards.map((lb) => {
      const entry = lb.entries.find((e) => String(e.userId) === String(req.user._id));
      return {
        courseId: lb.courseId._id,
        courseTitle: lb.courseId.title,
        rank: entry?.rank || '-',
        points: entry?.points || 0,
        totalParticipants: lb.entries.length,
      };
    });

    res.json(successResponse('My ranks fetched.', { ranks }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaderboard, getMyRanks };
