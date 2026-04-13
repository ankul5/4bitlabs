const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const User = require('../models/User');

// ─── PUT /api/v1/admin/users/:id/points ─────────────────────────────────────
const manuallyUpdatePoints = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { points, reason } = req.body; // e.g. add 50 points or -10 points

    const parsedPoints = parseInt(points, 10);
    if (isNaN(parsedPoints)) return res.status(400).json(errorResponse('Invalid points value.'));

    await User.incrementPoints(id, parsedPoints);

    // Track the reason (optional feature)
    // Could track via a 'point_ledgers' table, but for now we just return success
    
    // Attempt to update leaderboard entry globally (fetch max points)
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (rows.length > 0) {
      const u = rows[0];
      if (req.io) {
        req.io.emit('leaderboard:refresh'); // Trigger global refresh for real-time
      }
      return res.json(successResponse('Points updated successfully.', { userId: id, newTotalPoints: u.points }));
    }

    res.json(successResponse('Points updated successfully.', { } ));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/admin/attendance/:id/override ──────────────────────────────
const overrideAttendance = async (req, res, next) => {
  try {
    const { id } = req.params; // attendance record ID
    const { status, remarks } = req.body; // 'present' or 'absent'

    if (!['present', 'absent'].includes(status)) {
      return res.status(400).json(errorResponse('Status must be present or absent.'));
    }

    const { rows } = await pool.query(
      `UPDATE attendance SET status = $1, remarks = $2 WHERE id = $3 RETURNING *`,
      [status, remarks || 'Mentor Manual Override', id]
    );

    if (rows.length === 0) return res.status(404).json(errorResponse('Attendance record not found.'));

    res.json(successResponse('Attendance overridden successfully.', { record: rows[0] }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  manuallyUpdatePoints,
  overrideAttendance
};
