const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const ADMIN_USERNAMES = ['ankul@4bit', 'aman@4bit', 'devraj@4bit', 'lokesh@4bit', 'rohit@4bit'];
const ADMIN_PASSWORD = '4bitlabs2026';

/**
 * POST /api/v1/auth/login
 * Body: { username, password }
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    // Check admin
    const normalizedUsername = username.trim().toLowerCase();
    console.log('--- LOGIN ATTEMPT ---');
    console.log('Username:', username);
    console.log('Normalized Username:', normalizedUsername);
    console.log('Is Admin Username Match:', ADMIN_USERNAMES.includes(normalizedUsername));
    console.log('Is Password Match:', password === ADMIN_PASSWORD);
    console.log('---------------------');

    if (ADMIN_USERNAMES.includes(normalizedUsername) && password === ADMIN_PASSWORD) {
      const token = jwt.sign(
        { id: 0, role: 'admin', username: normalizedUsername },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      // Construct a nice display name
      const displayName = username.trim().split('@')[0];
      const capitalizedDisplayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      return res.json({
        success: true,
        message: 'Admin login successful.',
        token,
        user: { id: 0, role: 'admin', username: normalizedUsername, full_name: capitalizedDisplayName },
      });
    }

    // Check student
    const studentUsername = username.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const { rows } = await pool.query(
      'SELECT s.*, sc.name as school_name FROM students s LEFT JOIN schools sc ON s.school_id = sc.id WHERE s.username = $1',
      [studentUsername]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid name or password.' });
    }

    const student = rows[0];
    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid name or password.' });
    }

    const token = jwt.sign(
      { id: student.id, role: 'student', school_id: student.school_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      message: 'Student login successful.',
      token,
      user: {
        id: student.id,
        role: 'student',
        full_name: student.full_name,
        username: student.username,
        school_id: student.school_id,
        school_name: student.school_name,
        phone: student.phone || '',
        is_verified: !!student.is_verified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/register
 * Body: { full_name, password, school_id, phone }
 */
const register = async (req, res, next) => {
  try {
    const { full_name, password, school_id, phone } = req.body;

    if (!full_name || !password || !school_id || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const username = full_name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    // Check duplicate username
    const existing = await pool.query('SELECT id FROM students WHERE username = $1', [username]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'A student with this name is already registered.' });
    }

    // Check school exists
    const schoolCheck = await pool.query('SELECT id FROM schools WHERE id = $1', [school_id]);
    if (!schoolCheck.rows || schoolCheck.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid school selected.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const escapeSQL = (val) => String(val).replace(/'/g, "''");
    await pool.query(
      `INSERT INTO students (full_name, username, password, school_id, phone, is_verified) VALUES ('${escapeSQL(full_name)}', '${escapeSQL(username)}', '${escapeSQL(hashedPassword)}', ${Number(school_id)}, '${escapeSQL(phone)}', false)`
    );

    return res.status(201).json({ success: true, message: 'Registration successful. Please login.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register };
