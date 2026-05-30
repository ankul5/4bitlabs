const { pool } = require('../config/database');

const getSchools = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM schools ORDER BY name ASC');
    res.json({ success: true, schools: rows || [] });
  } catch (error) {
    next(error);
  }
};

const createSchool = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'School name is required.' });
    }

    const existing = await pool.query('SELECT id FROM schools WHERE LOWER(name) = LOWER($1)', [name.trim()]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'School already exists.' });
    }

    const { rows } = await pool.query(
      'INSERT INTO schools (name) VALUES ($1) RETURNING *',
      [name.trim()]
    );
    res.status(201).json({ success: true, message: 'School created.', school: rows[0] });
  } catch (error) {
    next(error);
  }
};

const deleteSchool = async (req, res, next) => {
  try {
    const { id } = req.params;
    const checkExist = await pool.query('SELECT id FROM schools WHERE id = $1', [id]);
    if (!checkExist.rows || checkExist.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'School not found.' });
    }
    await pool.query('DELETE FROM schools WHERE id = $1', [id]);
    res.json({ success: true, message: 'School deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSchools, createSchool, deleteSchool };
