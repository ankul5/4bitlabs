const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');
const Attendance = require('../models/Attendance');
const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// ─── GET /api/v1/users ───────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let q = 'SELECT u.*, s.name as school_name, s.code as school_code FROM users u LEFT JOIN schools s ON u.school_id = s.id WHERE 1=1';
    const vals = [];
    let i = 1;

    if (req.query.role) { q += ` AND u.role = $${i++}`; vals.push(req.query.role); }
    if (req.query.schoolId) { q += ` AND u.school_id = $${i++}`; vals.push(req.query.schoolId); }
    if (req.query.isActive !== undefined) { q += ` AND u.is_active = $${i++}`; vals.push(req.query.isActive === 'true'); }
    if (req.query.search) { q += ` AND (LOWER(u.name) LIKE $${i} OR LOWER(u.email) LIKE $${i})`; vals.push(`%${req.query.search.toLowerCase()}%`); i++; }
    if (req.user.role === 'school_admin' && req.user.schoolId) {
      q += ` AND u.school_id = $${i++}`; vals.push(req.user.schoolId._id || req.user.schoolId);
    }

    const countQ = q.replace('SELECT u.*, s.name as school_name, s.code as school_code', 'SELECT COUNT(*)');
    const { rows: countRows } = await pool.query(countQ, vals);
    const total = parseInt(countRows[0].count);

    q += ` ORDER BY u.created_at DESC LIMIT $${i++} OFFSET $${i++}`;
    vals.push(limit, offset);
    const { rows } = await pool.query(q, vals);

    res.json(successResponse('Users fetched.', { users: rows, total, page, totalPages: Math.ceil(total / limit) }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/users/:id ───────────────────────────────────────────────────
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json(errorResponse('User not found.'));
    res.json(successResponse('User fetched.', { user }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/users/:id/role ──────────────────────────────────────────────
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { rows } = await pool.query('UPDATE users SET role=$1, updated_at=NOW() WHERE id=$2 RETURNING *', [role, req.params.id]);
    if (!rows[0]) return res.status(404).json(errorResponse('User not found.'));
    res.json(successResponse(`Role updated to '${role}'.`, { user: rows[0] }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/users/:id/deactivate ────────────────────────────────────────
const deactivateUser = async (req, res, next) => {
  try {
    const { rows } = await pool.query('UPDATE users SET is_active=FALSE, updated_at=NOW() WHERE id=$1 RETURNING id, name, email, is_active', [req.params.id]);
    if (!rows[0]) return res.status(404).json(errorResponse('User not found.'));
    res.json(successResponse('User deactivated.', { user: rows[0] }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/users/:id/activate ──────────────────────────────────────────
const activateUser = async (req, res, next) => {
  try {
    const { rows } = await pool.query('UPDATE users SET is_active=TRUE, updated_at=NOW() WHERE id=$1 RETURNING id, name, email, is_active', [req.params.id]);
    if (!rows[0]) return res.status(404).json(errorResponse('User not found.'));
    res.json(successResponse('User activated.', { user: rows[0] }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/users/:id/stats ─────────────────────────────────────────────
const getUserStats = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json(errorResponse('User not found.'));

    const [enrollCount, attemptCount, attendCount] = await Promise.all([
      Enrollment.countDocuments({ user_id: userId, status: 'active' }),
      QuizAttempt.countDocuments({ user_id: userId }),
      Attendance.countDocuments({ user_id: userId, status: 'present' }),
    ]);

    const { rows: perf } = await pool.query(
      `SELECT AVG(percentage) as avg_pct, SUM(total_points) as total_pts, COUNT(*) as total_att, SUM(CASE WHEN passed THEN 1 ELSE 0 END) as pass_ct
       FROM quiz_attempts WHERE user_id=$1`,
      [userId]
    );

    res.json(successResponse('User stats fetched.', {
      user,
      stats: {
        enrolledCourses: enrollCount, quizAttempts: attemptCount, lecturesAttended: attendCount,
        quizPerformance: {
          avgPercentage: parseFloat(perf[0]?.avg_pct) || 0,
          totalPoints: parseInt(perf[0]?.total_pts) || 0,
          totalAttempts: parseInt(perf[0]?.total_att) || 0,
          passCount: parseInt(perf[0]?.pass_ct) || 0,
        },
      },
    }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/users/me ────────────────────────────────────────────────────
const updateMe = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, email, phone, avatar } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name=$${idx++}`); values.push(name); }
    if (email !== undefined) { fields.push(`email=$${idx++}`); values.push(email); }
    if (phone !== undefined) { fields.push(`phone=$${idx++}`); values.push(phone); }
    if (avatar !== undefined) { fields.push(`avatar=$${idx++}`); values.push(avatar); }

    if (fields.length === 0) return res.status(400).json(errorResponse('Nothing to update.'));

    fields.push(`updated_at=NOW()`);
    values.push(userId);

    const q = `UPDATE users SET ${fields.join(', ')} WHERE id=$${idx} RETURNING *`;
    const { rows } = await pool.query(q, values);

    if (!rows || rows.length === 0) return res.status(404).json(errorResponse('User not found.'));

    res.json(successResponse('Profile updated.', { user: rows[0] }));
  } catch (error) {
    if (error.code === '23505') { // unique violation
      return res.status(400).json(errorResponse('Email already used by another account.'));
    }
    next(error);
  }
};

module.exports = { getUsers, getUser, updateUserRole, deactivateUser, activateUser, getUserStats, updateMe };
