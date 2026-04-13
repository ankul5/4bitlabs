const { pool } = require('../config/database');

const MentorBooking = {
  async find(filter = {}) {
    let q = `SELECT mb.*, mp.name as mentor_name, mp.avatar as mentor_avatar, mp.role as mentor_role, mp.fcm_token as mentor_fcm_token
             FROM mentor_bookings mb LEFT JOIN mentor_profiles mp ON mb.mentor_id = mp.id WHERE 1=1`;
    const vals = [];
    let i = 1;
    if (filter.student_id) { q += ` AND mb.student_id = $${i++}`; vals.push(filter.student_id); }
    if (filter.mentor_id) { q += ` AND mb.mentor_id = $${i++}`; vals.push(filter.mentor_id); }
    if (filter.status) { q += ` AND mb.status = $${i++}`; vals.push(filter.status); }
    if (filter.statuses) { q += ` AND mb.status = ANY($${i++}::text[])`; vals.push(filter.statuses); }
    q += ' ORDER BY mb.created_at DESC';
    const { rows } = await pool.query(q, vals);
    return rows.map(formatBooking);
  },

  async findOne(filter = {}) {
    const results = await this.find(filter);
    return results[0] || null;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT mb.*, mp.name as mentor_name, mp.avatar as mentor_avatar, mp.role as mentor_role, mp.fcm_token as mentor_fcm_token
       FROM mentor_bookings mb LEFT JOIN mentor_profiles mp ON mb.mentor_id = mp.id WHERE mb.id = $1`,
      [id]
    );
    return rows[0] ? formatBooking(rows[0]) : null;
  },

  async create(data) {
    const { student_id, mentor_id, slot_date, slot_time, razorpay_order_id, amount_paid = 5000, status = 'pending_payment' } = data;
    const { rows } = await pool.query(
      `INSERT INTO mentor_bookings (student_id, mentor_id, slot_date, slot_time, razorpay_order_id, amount_paid, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [student_id, mentor_id, slot_date, slot_time, razorpay_order_id, amount_paid, status]
    );
    return formatBooking(rows[0]);
  },

  async findOneAndUpdate(filter, data) {
    const booking = await this.findOne(filter);
    if (!booking) return null;
    return this.updateById(booking.id, data);
  },

  async updateById(id, data) {
    const fields = [`updated_at = NOW()`];
    const values = [];
    let idx = 1;
    const map = { status: 'status', razorpay_payment_id: 'razorpay_payment_id', razorpay_signature: 'razorpay_signature', rating: 'rating', review: 'review', meeting_link: 'meeting_link' };
    for (const [key, col] of Object.entries(map)) {
      if (data[key] !== undefined) { fields.push(`${col} = $${idx++}`); values.push(data[key]); }
    }
    values.push(id);
    const { rows } = await pool.query(`UPDATE mentor_bookings SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    return rows[0] ? formatBooking(rows[0]) : null;
  },

  async findByMentorIdWithRating(mentorId) {
    const { rows } = await pool.query(
      'SELECT rating FROM mentor_bookings WHERE mentor_id = $1 AND rating IS NOT NULL',
      [mentorId]
    );
    return rows;
  },
};

function formatBooking(row) {
  return {
    _id: row.id, id: row.id, studentId: row.student_id, mentorId: {
      _id: row.mentor_id, id: row.mentor_id, name: row.mentor_name, avatar: row.mentor_avatar, role: row.mentor_role, fcmToken: row.mentor_fcm_token,
    },
    slot: { date: row.slot_date, time: row.slot_time },
    razorpayOrderId: row.razorpay_order_id, razorpayPaymentId: row.razorpay_payment_id,
    razorpaySignature: row.razorpay_signature, amountPaid: row.amount_paid,
    currency: row.currency, status: row.status, notes: row.notes, meetingLink: row.meeting_link,
    rating: row.rating, review: row.review, createdAt: row.created_at,
  };
}

module.exports = MentorBooking;
