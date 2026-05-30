const { pool } = require('../config/database');

const getContent = async (req, res, next) => {
  try {
    const { schoolId, type } = req.query;
    let query = 'SELECT * FROM content WHERE 1=1';
    const params = [];

    if (schoolId) {
      params.push(schoolId);
      query += ` AND school_id = $${params.length}`;
    }
    if (type) {
      params.push(type);
      query += ` AND type = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json({ success: true, content: rows || [] });
  } catch (error) {
    next(error);
  }
};

const createContent = async (req, res, next) => {
  try {
    const { school_id, type, title, url_or_content } = req.body;
    if (!school_id || !type || !title || !url_or_content) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (!['video', 'code', 'connection'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be video, code, or connection.' });
    }

    const { rows } = await pool.query(
      'INSERT INTO content (school_id, type, title, url_or_content) VALUES ($1, $2, $3, $4) RETURNING *',
      [school_id, type, title, url_or_content]
    );
    res.status(201).json({ success: true, message: 'Content created.', content: rows[0] });
  } catch (error) {
    next(error);
  }
};

const updateContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, url_or_content } = req.body;

    const checkExist = await pool.query('SELECT id FROM content WHERE id = $1', [id]);
    if (!checkExist.rows || checkExist.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }

    await pool.query(
      'UPDATE content SET title = $1, url_or_content = $2, updated_at = NOW() WHERE id = $3',
      [title, url_or_content, id]
    );
    res.json({ success: true, message: 'Content updated.', content: { id, title, url_or_content } });
  } catch (error) {
    next(error);
  }
};

const deleteContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const checkExist = await pool.query('SELECT id FROM content WHERE id = $1', [id]);
    if (!checkExist.rows || checkExist.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }
    await pool.query('DELETE FROM content WHERE id = $1', [id]);
    res.json({ success: true, message: 'Content deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getContent, createContent, updateContent, deleteContent };
