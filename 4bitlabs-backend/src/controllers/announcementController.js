const { pool } = require('../config/database');

const cleanupAnnouncements = async (schoolId) => {
  try {
    // 1. Delete announcements older than 3 days
    await pool.query("DELETE FROM announcements WHERE created_at < NOW() - INTERVAL '3 days'");

    // 2. Keep only the 10 most recent announcements per school
    if (schoolId) {
      await pool.query(
        `DELETE FROM announcements 
         WHERE school_id = $1 
           AND id NOT IN (
             SELECT id FROM (
               SELECT id FROM announcements 
               WHERE school_id = $1 
               ORDER BY created_at DESC 
               LIMIT 10
             ) tmp
           )`,
        [schoolId]
      );
    }
  } catch (error) {
    console.error('Failed to cleanup announcements:', error.message);
  }
};

const getAnnouncements = async (req, res, next) => {
  try {
    const { schoolId } = req.query;
    if (schoolId) {
      await cleanupAnnouncements(schoolId);
    }

    let query = 'SELECT * FROM announcements';
    const params = [];

    if (schoolId) {
      params.push(schoolId);
      query += ` WHERE school_id = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json({ success: true, announcements: rows || [] });
  } catch (error) {
    next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { school_id, title, message } = req.body;
    if (!school_id || !title || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const { rows } = await pool.query(
      'INSERT INTO announcements (school_id, title, message) VALUES ($1, $2, $3) RETURNING *',
      [school_id, title, message]
    );

    // Run cleanup
    await cleanupAnnouncements(school_id);

    res.status(201).json({ success: true, message: 'Announcement created.', announcement: rows[0] });
  } catch (error) {
    next(error);
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, message } = req.body;

    const checkExist = await pool.query('SELECT id FROM announcements WHERE id = $1', [id]);
    if (!checkExist.rows || checkExist.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    await pool.query(
      'UPDATE announcements SET title = $1, message = $2, updated_at = NOW() WHERE id = $3',
      [title, message, id]
    );
    res.json({ success: true, message: 'Announcement updated.', announcement: { id, title, message } });
  } catch (error) {
    next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const checkExist = await pool.query('SELECT id FROM announcements WHERE id = $1', [id]);
    if (!checkExist.rows || checkExist.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }
    await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
