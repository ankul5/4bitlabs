const { pool } = require('../config/database');

const QuizAttempt = {
  async find(filter = {}) {
    let q = `SELECT qa.*, u.name as user_name, u.email as user_email, u.avatar as user_avatar FROM quiz_attempts qa LEFT JOIN users u ON qa.user_id = u.id WHERE 1=1`;
    const vals = [];
    let i = 1;
    if (filter.user_id) { q += ` AND qa.user_id = $${i++}`; vals.push(filter.user_id); }
    if (filter.quiz_id) { q += ` AND qa.quiz_id = $${i++}`; vals.push(filter.quiz_id); }
    if (filter.quiz_ids) { q += ` AND qa.quiz_id = ANY($${i++}::uuid[])`; vals.push(filter.quiz_ids); }
    q += ' ORDER BY qa.completed_at DESC';
    if (filter.limit) { q += ` LIMIT $${i++}`; vals.push(filter.limit); }
    if (filter.offset) { q += ` OFFSET $${i++}`; vals.push(filter.offset); }
    const { rows } = await pool.query(q, vals);
    return rows.map(formatAttempt);
  },

  async countDocuments(filter = {}) {
    let q = 'SELECT COUNT(*) FROM quiz_attempts WHERE 1=1';
    const vals = [];
    let i = 1;
    if (filter.user_id) { q += ` AND user_id = $${i++}`; vals.push(filter.user_id); }
    if (filter.quiz_id) { q += ` AND quiz_id = $${i++}`; vals.push(filter.quiz_id); }
    const { rows } = await pool.query(q, vals);
    return parseInt(rows[0].count);
  },

  async create(data) {
    const { user_id, quiz_id, course_id, school_id, answers, score, total_points, max_points, percentage, passed, time_taken_seconds, attempt_number, status } = data;
    const { rows } = await pool.query(
      `INSERT INTO quiz_attempts (user_id, quiz_id, course_id, school_id, answers, score, total_points, max_points, percentage, passed, time_taken_seconds, attempt_number, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [user_id, quiz_id, course_id, school_id, JSON.stringify(answers), score, total_points, max_points, percentage, passed, time_taken_seconds || 0, attempt_number || 1, status || 'completed']
    );
    return formatAttempt(rows[0]);
  },

  async deleteMany(filter = {}) {
    if (filter.quiz_id) {
      await pool.query('DELETE FROM quiz_attempts WHERE quiz_id = $1', [filter.quiz_id]);
    }
  },
};

function formatAttempt(row) {
  return {
    _id: row.id, id: row.id, userId: row.user_id, quizId: row.quiz_id, courseId: row.course_id, schoolId: row.school_id,
    answers: row.answers || [], score: row.score, totalPoints: row.total_points, maxPoints: row.max_points,
    percentage: parseFloat(row.percentage), passed: row.passed, timeTakenSeconds: row.time_taken_seconds,
    attemptNumber: row.attempt_number, status: row.status, completedAt: row.completed_at,
    userId: row.user_id && row.user_name ? { _id: row.user_id, name: row.user_name, email: row.user_email, avatar: row.user_avatar } : row.user_id,
  };
}

module.exports = QuizAttempt;
