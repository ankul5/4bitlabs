const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');
const Attendance = require('../models/Attendance');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHelper');

// ─── GET /api/v1/users — Admin lists all users ─────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    // Filters
    if (req.query.role) filter.role = req.query.role;
    if (req.query.schoolId) filter.schoolId = req.query.schoolId;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // School-scoped for school admins
    if (req.user.role === 'school_admin') {
      filter.schoolId = req.user.schoolId;
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('name email phone avatar role schoolId points isActive isVerified createdAt')
      .populate('schoolId', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json(paginatedResponse('Users fetched.', users, page, limit, total));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/users/:id — Admin gets user detail ────────────────────────
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('schoolId', 'name code logo')
      .populate('courseIds', 'title thumbnailUrl')
      .lean();
    if (!user) return res.status(404).json(errorResponse('User not found.'));
    res.json(successResponse('User fetched.', { user }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/users/:id/role — Admin changes user role ──────────────────
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('name email role');

    if (!user) return res.status(404).json(errorResponse('User not found.'));
    res.json(successResponse(`Role updated to '${role}'.`, { user }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/users/:id/deactivate — Admin deactivates user ─────────────
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('name email isActive');

    if (!user) return res.status(404).json(errorResponse('User not found.'));
    res.json(successResponse('User deactivated.', { user }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/users/:id/activate — Admin reactivates user ─────────────
const activateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('name email isActive');

    if (!user) return res.status(404).json(errorResponse('User not found.'));
    res.json(successResponse('User activated.', { user }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/users/:id/stats — Admin views user statistics ─────────────
const getUserStats = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('name email role points').lean();
    if (!user) return res.status(404).json(errorResponse('User not found.'));

    const [enrollmentCount, quizAttemptCount, attendanceCount] = await Promise.all([
      Enrollment.countDocuments({ userId, status: 'active' }),
      QuizAttempt.countDocuments({ userId }),
      Attendance.countDocuments({ userId, status: 'present' }),
    ]);

    // Quiz performance
    const quizPerformance = await QuizAttempt.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          avgPercentage: { $avg: '$percentage' },
          totalPoints: { $sum: '$totalPoints' },
          totalAttempts: { $sum: 1 },
          passCount: { $sum: { $cond: ['$passed', 1, 0] } },
        },
      },
    ]);

    res.json(successResponse('User stats fetched.', {
      user,
      stats: {
        enrolledCourses: enrollmentCount,
        quizAttempts: quizAttemptCount,
        lecturesAttended: attendanceCount,
        quizPerformance: quizPerformance[0] || {
          avgPercentage: 0,
          totalPoints: 0,
          totalAttempts: 0,
          passCount: 0,
        },
      },
    }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUser, updateUserRole, deactivateUser, activateUser, getUserStats };
