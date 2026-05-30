const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const getStudents = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT s.id, s.full_name, s.username, s.phone, s.is_verified, s.school_id, s.created_at, sc.name as school_name FROM students s LEFT JOIN schools sc ON s.school_id = sc.id ORDER BY s.created_at DESC'
    );
    res.json({ success: true, students: rows || [] });
  } catch (error) {
    next(error);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const { full_name, password, school_id, phone } = req.body;
    if (!full_name || !password || !school_id || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const username = full_name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    const existing = await pool.query('SELECT id FROM students WHERE username = $1', [username]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'A student with this name already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const escapeSQL = (val) => String(val).replace(/'/g, "''");
    const { rows } = await pool.query(
      `INSERT INTO students (full_name, username, password, school_id, phone, is_verified) VALUES ('${escapeSQL(full_name)}', '${escapeSQL(username)}', '${escapeSQL(hashedPassword)}', ${Number(school_id)}, '${escapeSQL(phone)}', true) RETURNING id, full_name, username, school_id, phone, is_verified, created_at`
    );
    res.status(201).json({ success: true, message: 'Student created.', student: rows[0] });
  } catch (error) {
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, password, school_id, phone, is_verified } = req.body;

    if (!full_name || !school_id) {
      return res.status(400).json({ success: false, message: 'Full name and school are required.' });
    }

    const checkExist = await pool.query(`SELECT id FROM students WHERE id = ${Number(id)}`);
    if (!checkExist.rows || checkExist.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const username = full_name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    const escapeSQL = (val) => String(val).replace(/'/g, "''");
    let query;
    const isVerifiedBool = is_verified !== undefined ? !!is_verified : true;
    const phoneStr = phone || '';
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query = `UPDATE students SET full_name = '${escapeSQL(full_name)}', username = '${escapeSQL(username)}', password = '${escapeSQL(hashedPassword)}', school_id = ${Number(school_id)}, phone = '${escapeSQL(phoneStr)}', is_verified = ${isVerifiedBool} WHERE id = ${Number(id)}`;
    } else {
      query = `UPDATE students SET full_name = '${escapeSQL(full_name)}', username = '${escapeSQL(username)}', school_id = ${Number(school_id)}, phone = '${escapeSQL(phoneStr)}', is_verified = ${isVerifiedBool} WHERE id = ${Number(id)}`;
    }

    await pool.query(query);
    res.json({
      success: true,
      message: 'Student updated.',
      student: { id: Number(id), full_name, username, school_id, phone: phoneStr, is_verified: isVerifiedBool }
    });
  } catch (error) {
    next(error);
  }
};

const verifyStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const checkExist = await pool.query(`SELECT id, full_name FROM students WHERE id = ${Number(id)}`);
    if (!checkExist.rows || checkExist.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    await pool.query(
      `UPDATE students SET is_verified = true WHERE id = ${Number(id)}`
    );
    res.json({
      success: true,
      message: 'Student verified successfully.',
      student: { id: Number(id), full_name: checkExist.rows[0].full_name, is_verified: true }
    });
  } catch (error) {
    next(error);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const checkExist = await pool.query('SELECT id FROM students WHERE id = $1', [id]);
    if (!checkExist.rows || checkExist.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    await pool.query('DELETE FROM students WHERE id = $1', [id]);
    res.json({ success: true, message: 'Student deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStudents, createStudent, updateStudent, verifyStudent, deleteStudent };
