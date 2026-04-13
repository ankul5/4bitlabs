const { pool } = require('../config/database');

const Enrollment = {
  async find(filter = {}) {
    let q = `SELECT e.*, c.title as course_title, c.description as course_desc, c.thumbnail_url, c.category, c.enrolled_count,
             s.name as school_name, s.code as school_code
             FROM enrollments e LEFT JOIN courses c ON e.course_id = c.id LEFT JOIN schools s ON e.school_id = s.id WHERE 1=1`;
    const vals = [];
    let i = 1;
    if (filter.user_id) { q += ` AND e.user_id = $${i++}`; vals.push(filter.user_id); }
    if (filter.course_id) { q += ` AND e.course_id = $${i++}`; vals.push(filter.course_id); }
    if (filter.status) { q += ` AND e.status = $${i++}`; vals.push(filter.status); }
    if (filter.statuses) { q += ` AND e.status = ANY($${i++}::text[])`; vals.push(filter.statuses); }
    q += ' ORDER BY e.enrolled_at DESC';
    if (filter.limit) { q += ` LIMIT $${i++}`; vals.push(filter.limit); }
    if (filter.offset) { q += ` OFFSET $${i++}`; vals.push(filter.offset); }
    const { rows } = await pool.query(q, vals);
    return rows.map(formatEnrollment);
  },

  async findOne(filter = {}) {
    const results = await this.find(filter);
    return results[0] || null;
  },

  async countDocuments(filter = {}) {
    let q = 'SELECT COUNT(*) FROM enrollments WHERE 1=1';
    const vals = [];
    let i = 1;
    if (filter.course_id) { q += ` AND course_id = $${i++}`; vals.push(filter.course_id); }
    if (filter.status) { q += ` AND status = $${i++}`; vals.push(filter.status); }
    const { rows } = await pool.query(q, vals);
    return parseInt(rows[0].count);
  },

  async create(data) {
    const { user_id, course_id, school_id } = data;
    const { rows } = await pool.query(
      `INSERT INTO enrollments (user_id, course_id, school_id) VALUES ($1,$2,$3) RETURNING *`,
      [user_id, course_id, school_id]
    );
    return formatEnrollment(rows[0]);
  },

  async findOneAndUpdate(filter, data) {
    const enrollment = await this.findOne(filter);
    if (!enrollment) return null;
    const fields = [`updated_at = NOW()`];
    const values = [];
    let idx = 1;
    if (data.status) { fields.push(`status = $${idx++}`); values.push(data.status); }
    if (data.progress !== undefined) { fields.push(`progress = $${idx++}`); values.push(data.progress); }
    if (data.completed_at) { fields.push(`completed_at = $${idx++}`); values.push(data.completed_at); }
    if (data.last_accessed_at) { fields.push(`last_accessed_at = $${idx++}`); values.push(data.last_accessed_at); }
    if (data.completed_lectures) { fields.push(`completed_lectures = $${idx++}::uuid[]`); values.push(data.completed_lectures); }
    values.push(enrollment.id);
    const { rows } = await pool.query(`UPDATE enrollments SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    return rows[0] ? formatEnrollment(rows[0]) : null;
  },

  async updateById(id, data) {
    return this.findOneAndUpdate({ id }, data);
  },

  async countPresent(userId) {
    const { rows } = await pool.query(`SELECT COUNT(*) FROM attendance WHERE user_id = $1 AND status = 'present'`, [userId]);
    return parseInt(rows[0].count);
  },
};

function formatEnrollment(row) {
  return {
    _id: row.id, id: row.id, userId: row.user_id,
    courseId: row.course_title ? { _id: row.course_id, id: row.course_id, title: row.course_title, description: row.course_desc, thumbnailUrl: row.thumbnail_url, category: row.category, enrolledCount: row.enrolled_count } : row.course_id,
    schoolId: row.school_name ? { _id: row.school_id, name: row.school_name, code: row.school_code } : row.school_id,
    status: row.status, enrolledAt: row.enrolled_at, completedAt: row.completed_at,
    progress: parseFloat(row.progress) || 0, completedLectures: row.completed_lectures || [],
    lastAccessedAt: row.last_accessed_at,
  };
}

module.exports = Enrollment;
