const { pool } = require('../config/database');

const User = {
  async findOne(filter) {
    const { uid, email, id } = filter;
    if (uid) {
      const { rows } = await pool.query(
        'SELECT u.*, s.name AS school_name, s.code AS school_code, s.logo AS school_logo FROM users u LEFT JOIN schools s ON u.school_id = s.id WHERE u.uid = $1',
        [uid]
      );
      return rows[0] ? formatUser(rows[0]) : null;
    }
    if (email) {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return rows[0] ? formatUser(rows[0]) : null;
    }
    if (id) {
      const { rows } = await pool.query(
        'SELECT u.*, s.name AS school_name, s.code AS school_code, s.logo AS school_logo FROM users u LEFT JOIN schools s ON u.school_id = s.id WHERE u.id = $1',
        [id]
      );
      return rows[0] ? formatUser(rows[0]) : null;
    }
    return null;
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT u.*, s.name AS school_name, s.code AS school_code, s.logo AS school_logo FROM users u LEFT JOIN schools s ON u.school_id = s.id WHERE u.id = $1',
      [id]
    );
    return rows[0] ? formatUser(rows[0]) : null;
  },

  async findByUid(uid) {
    const { rows } = await pool.query(
      'SELECT u.*, s.name AS school_name, s.code AS school_code, s.logo AS school_logo FROM users u LEFT JOIN schools s ON u.school_id = s.id WHERE u.uid = $1',
      [uid]
    );
    return rows[0] ? formatUser(rows[0]) : null;
  },

  async create(data) {
    const { uid, name, email, phone = '', avatar = '', role = 'student', school_id, is_verified = false } = data;
    const { rows } = await pool.query(
      `INSERT INTO users (uid, name, email, phone, avatar, role, school_id, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [uid, name, email, phone, avatar, role, school_id || null, is_verified]
    );
    return formatUser(rows[0]);
  },

  async findByIdAndUpdate(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
    if (data.phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(data.phone); }
    if (data.avatar !== undefined) { fields.push(`avatar = $${idx++}`); values.push(data.avatar); }
    if (data.points !== undefined) { fields.push(`points = $${idx++}`); values.push(data.points); }
    if (data.points_inc !== undefined) { fields.push(`points = points + $${idx++}`); values.push(data.points_inc); }
    if (data.school_id !== undefined) { fields.push(`school_id = $${idx++}`); values.push(data.school_id); }
    if (data.fcm_tokens !== undefined) { fields.push(`fcm_tokens = $${idx++}`); values.push(data.fcm_tokens); }
    if (fields.length === 0) return this.findById(id);
    fields.push(`updated_at = NOW()`);
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0] ? formatUser(rows[0]) : null;
  },

  async addFcmToken(id, token) {
    await pool.query(
      `UPDATE users SET fcm_tokens = array_append(fcm_tokens, $1), updated_at = NOW() WHERE id = $2 AND NOT ($1 = ANY(fcm_tokens))`,
      [token, id]
    );
  },

  async incrementPoints(id, points) {
    await pool.query('UPDATE users SET points = points + $1, updated_at = NOW() WHERE id = $2', [points, id]);
  },
};

function formatUser(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    uid: row.uid,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    avatar: row.avatar || '',
    role: row.role,
    schoolId: row.school_id ? {
      _id: row.school_id,
      id: row.school_id,
      name: row.school_name || '',
      code: row.school_code || '',
      logo: row.school_logo || '',
    } : null,
    points: row.points || 0,
    streak: row.streak || 0,
    fcmTokens: row.fcm_tokens || [],
    isActive: row.is_active,
    isVerified: row.is_verified,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = User;
