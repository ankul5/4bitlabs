const { pool } = require('../config/database');

const Mentor = {
  async find(filter = {}) {
    let q = `SELECT mp.*, u.name as user_name, u.email as user_email FROM mentor_profiles mp LEFT JOIN users u ON mp.user_id = u.id WHERE 1=1`;
    const vals = [];
    let i = 1;
    if (filter.is_available !== undefined) { q += ` AND mp.is_available = $${i++}`; vals.push(filter.is_available); }
    if (filter.skill) { q += ` AND $${i++} = ANY(mp.skills)`; vals.push(filter.skill); }
    q += ' ORDER BY mp.rating DESC, mp.review_count DESC';
    const { rows } = await pool.query(q, vals);
    return rows.map(formatMentor);
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM mentor_profiles WHERE id = $1', [id]);
    return rows[0] ? formatMentor(rows[0]) : null;
  },

  async findByUserId(userId) {
    const { rows } = await pool.query('SELECT * FROM mentor_profiles WHERE user_id = $1', [userId]);
    return rows[0] ? formatMentor(rows[0]) : null;
  },

  async create(data) {
    const { user_id, uid, name, avatar = '', role = 'Mentor', bio = '', skills = [], experience = '', session_price = 50, available_slots = [], fcm_token = '' } = data;
    const { rows } = await pool.query(
      `INSERT INTO mentor_profiles (user_id, uid, name, avatar, role, bio, skills, experience, session_price, available_slots, fcm_token)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [user_id, uid, name, avatar, role, bio, skills, experience, session_price, JSON.stringify(available_slots), fcm_token]
    );
    return formatMentor(rows[0]);
  },

  async findByIdAndUpdate(id, data) {
    const fields = [`updated_at = NOW()`];
    const values = [];
    let idx = 1;
    for (const [key, col] of [['name','name'],['avatar','avatar'],['bio','bio'],['skills','skills'],['experience','experience'],['rating','rating'],['review_count','review_count'],['session_price','session_price'],['is_available','is_available'],['is_verified','is_verified'],['available_slots','available_slots'],['fcm_token','fcm_token'],['total_sessions_completed','total_sessions_completed']]) {
      if (data[key] !== undefined) {
        fields.push(`${col} = $${idx++}`);
        values.push(col === 'available_slots' ? JSON.stringify(data[key]) : data[key]);
      }
    }
    values.push(id);
    const { rows } = await pool.query(`UPDATE mentor_profiles SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    return rows[0] ? formatMentor(rows[0]) : null;
  },

  async findByIdAndDelete(id) {
    const { rows } = await pool.query('DELETE FROM mentor_profiles WHERE id = $1 RETURNING *', [id]);
    return rows[0] ? formatMentor(rows[0]) : null;
  },
};

function formatMentor(row) {
  return {
    _id: row.id, id: row.id, userId: row.user_id, uid: row.uid, name: row.name,
    avatar: row.avatar || '', role: row.role, bio: row.bio, skills: row.skills || [],
    experience: row.experience, rating: parseFloat(row.rating) || 0,
    reviewCount: row.review_count || 0, sessionPrice: row.session_price, isVerified: row.is_verified,
    isAvailable: row.is_available, availableSlots: row.available_slots || [],
    totalSessionsCompleted: row.total_sessions_completed || 0, fcmToken: row.fcm_token,
    createdAt: row.created_at,
  };
}

module.exports = Mentor;
