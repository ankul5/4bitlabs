const { pool } = require('../config/database');

const Announcement = {
  async find(filter = {}) {
    let q = 'SELECT * FROM announcements WHERE 1=1';
    const vals = [];
    let i = 1;
    if (filter.school_id !== undefined) { q += ` AND (school_id = $${i++} OR school_id IS NULL)`; vals.push(filter.school_id); }
    if (filter.is_active !== undefined) { q += ` AND is_active = $${i++}`; vals.push(filter.is_active); }
    q += ' AND (expires_at IS NULL OR expires_at > NOW())';
    q += ' ORDER BY is_pinned DESC, created_at DESC';
    if (filter.limit) { q += ` LIMIT $${i++}`; vals.push(filter.limit); }
    const { rows } = await pool.query(q, vals);
    return rows.map(formatAnnouncement);
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM announcements WHERE id = $1', [id]);
    return rows[0] ? formatAnnouncement(rows[0]) : null;
  },

  async create(data) {
    const { title, body, type = 'general', school_id, course_id, created_by, image_url = '', link_url = '', is_pinned = false, expires_at, target_roles = [] } = data;
    const { rows } = await pool.query(
      `INSERT INTO announcements (title, body, type, school_id, course_id, created_by, image_url, link_url, is_pinned, expires_at, target_roles)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [title, body, type, school_id || null, course_id || null, created_by, image_url, link_url, is_pinned, expires_at || null, target_roles]
    );
    return formatAnnouncement(rows[0]);
  },

  async findByIdAndUpdate(id, data) {
    const fields = [`updated_at = NOW()`];
    const values = [];
    let idx = 1;
    for (const key of ['title','body','type','is_pinned','is_active','image_url','link_url']) {
      if (data[key] !== undefined) { fields.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${idx++}`); values.push(data[key]); }
    }
    values.push(id);
    const { rows } = await pool.query(`UPDATE announcements SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    return rows[0] ? formatAnnouncement(rows[0]) : null;
  },

  async findByIdAndDelete(id) {
    const { rows } = await pool.query('DELETE FROM announcements WHERE id = $1 RETURNING *', [id]);
    return rows[0] ? formatAnnouncement(rows[0]) : null;
  },
};

function formatAnnouncement(row) {
  return { _id: row.id, id: row.id, title: row.title, body: row.body, type: row.type, schoolId: row.school_id, courseId: row.course_id, createdBy: row.created_by, imageUrl: row.image_url, linkUrl: row.link_url, isPinned: row.is_pinned, isActive: row.is_active, expiresAt: row.expires_at, targetRoles: row.target_roles, createdAt: row.created_at };
}

module.exports = Announcement;
