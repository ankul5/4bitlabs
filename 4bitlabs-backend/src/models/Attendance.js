const { pool } = require('../config/database');

const Attendance = {
  async find(filter = {}) {
    let q = 'SELECT * FROM attendance WHERE 1=1';
    const vals = [];
    let i = 1;
    if (filter.user_id) { q += ` AND user_id = $${i++}`; vals.push(filter.user_id); }
    if (filter.course_id) { q += ` AND course_id = $${i++}`; vals.push(filter.course_id); }
    if (filter.status) { q += ` AND status = $${i++}`; vals.push(filter.status); }
    q += ' ORDER BY marked_at DESC';
    const { rows } = await pool.query(q, vals);
    return rows.map(formatAttendance);
  },

  async findOne(filter = {}) {
    const results = await this.find(filter);
    return results[0] || null;
  },

  async countDocuments(filter = {}) {
    let q = 'SELECT COUNT(*) FROM attendance WHERE 1=1';
    const vals = [];
    let i = 1;
    if (filter.user_id) { q += ` AND user_id = $${i++}`; vals.push(filter.user_id); }
    if (filter.status) { q += ` AND status = $${i++}`; vals.push(filter.status); }
    const { rows } = await pool.query(q, vals);
    return parseInt(rows[0].count);
  },

  async create(data) {
    const { user_id, course_id, lecture_id, school_id, date, status = 'present', watched_duration_seconds = 0 } = data;
    const { rows } = await pool.query(
      `INSERT INTO attendance (user_id, course_id, lecture_id, school_id, date, status, watched_duration_seconds)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (user_id, lecture_id) DO UPDATE SET status=EXCLUDED.status, watched_duration_seconds=EXCLUDED.watched_duration_seconds RETURNING *`,
      [user_id, course_id, lecture_id, school_id, date, status, watched_duration_seconds]
    );
    return formatAttendance(rows[0]);
  },

  async getStats(userId, courseIds) {
    const { rows } = await pool.query(
      `SELECT COUNT(*) as total FROM attendance WHERE user_id = $1 AND status = 'present'`,
      [userId]
    );
    return parseInt(rows[0].total);
  },
};

function formatAttendance(row) {
  return { _id: row.id, id: row.id, userId: row.user_id, courseId: row.course_id, lectureId: row.lecture_id, schoolId: row.school_id, date: row.date, status: row.status, watchedDurationSeconds: row.watched_duration_seconds, markedAt: row.marked_at };
}

module.exports = Attendance;
