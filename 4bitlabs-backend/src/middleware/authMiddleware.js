const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

/**
 * Protect routes — verifies JWT issued by our backend.
 * Attaches req.user with { id, role, ... }
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided. Access denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'admin') {
      req.user = { id: 0, role: 'admin', username: 'admin' };
    } else {
      const { rows } = await pool.query(
        'SELECT id, full_name, username, school_id FROM students WHERE id = $1',
        [decoded.id]
      );
      if (!rows || rows.length === 0) {
        return res.status(401).json({ success: false, message: 'User no longer exists.' });
      }
      req.user = { ...rows[0], role: 'student' };
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

module.exports = { protect };
