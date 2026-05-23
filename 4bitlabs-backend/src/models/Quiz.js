const { pool } = require('../config/database');

const Quiz = {
  async find(filter = {}) {
    let q = 'SELECT * FROM quizzes WHERE 1=1';
    const vals = [];
    let i = 1;
    if (filter.status) { q += ` AND status = $${i++}`; vals.push(filter.status); }
    if (filter.course_id) { q += ` AND course_id = $${i++}`; vals.push(filter.course_id); }
    if (filter.school_id) { q += ` AND school_id = $${i++}`; vals.push(filter.school_id); }
    if (filter.course_ids) { q += ` AND course_id = ANY($${i++}::uuid[])`; vals.push(filter.course_ids); }
    q += ' ORDER BY created_at DESC';
    if (filter.limit) { q += ` LIMIT $${i++}`; vals.push(filter.limit); }
    const { rows } = await pool.query(q, vals);
    return rows.map(formatQuiz);
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM quizzes WHERE id = $1', [id]);
    if (!rows[0]) return null;
    const quiz = formatQuiz(rows[0]);
    const { rows: questions } = await pool.query('SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY sort_order ASC', [id]);
    quiz.questions = questions.map(formatQuestion);
    return quiz;
  },

  async create(data) {
    const { title, course_id, school_id, created_by, duration = 15, category = '', status = 'draft', shuffle_questions = false, shuffle_options = false, show_results_immediately = true, attempt_limit = 1, available_from, available_to, questions = [] } = data;
    const totalMarks = questions.reduce((s, q) => s + (q.points || 10), 0);
    const passingMarks = Math.ceil(totalMarks * 0.6);
    const { rows } = await pool.query(
      `INSERT INTO quizzes (title, course_id, school_id, created_by, duration, total_marks, passing_marks, category, status, shuffle_questions, shuffle_options, show_results_immediately, attempt_limit, available_from, available_to)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [title, course_id, school_id, created_by || null, duration, totalMarks, passingMarks, category, status, shuffle_questions, shuffle_options, show_results_immediately, attempt_limit, available_from || null, available_to || null]
    );
    const quiz = formatQuiz(rows[0]);
    // Insert questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await pool.query(
        `INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, explanation, image_url, points, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [quiz.id, q.question, JSON.stringify(q.options), q.correctAnswer || q.correct_answer, q.explanation || '', q.imageUrl || q.image_url || '', q.points || 10, i]
      );
    }
    quiz.questions = questions;
    return quiz;
  },

  async findByIdAndUpdate(id, data) {
    const fields = [`updated_at = NOW()`];
    const values = [];
    let idx = 1;
    for (const [key, col] of [['title','title'],['status','status'],['duration','duration'],['category','category']]) {
      if (data[key] !== undefined) { fields.push(`${col} = $${idx++}`); values.push(data[key]); }
    }
    values.push(id);
    const { rows } = await pool.query(`UPDATE quizzes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    return rows[0] ? formatQuiz(rows[0]) : null;
  },

  async addQuestion(quizId, questionData) {
    const { question, options, correctAnswer, correct_answer, explanation = '', imageUrl, image_url, points = 10 } = questionData;
    const { rows: orderRows } = await pool.query('SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM quiz_questions WHERE quiz_id = $1', [quizId]);
    const sortOrder = orderRows[0]?.next_order || 0;
    const { rows } = await pool.query(
      `INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, explanation, image_url, points, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [quizId, question, JSON.stringify(options), correctAnswer || correct_answer, explanation, imageUrl || image_url || '', points, sortOrder]
    );
    // Update quiz total_marks and passing_marks
    const { rows: totalRows } = await pool.query('SELECT COALESCE(SUM(points), 0) as total FROM quiz_questions WHERE quiz_id = $1', [quizId]);
    const totalMarks = parseInt(totalRows[0]?.total || 0);
    await pool.query('UPDATE quizzes SET total_marks = $1, passing_marks = $2, updated_at = NOW() WHERE id = $3', [totalMarks, Math.ceil(totalMarks * 0.6), quizId]);
    return rows[0] ? formatQuestion(rows[0]) : null;
  },

  async findByIdAndDelete(id) {
    const { rows } = await pool.query('DELETE FROM quizzes WHERE id = $1 RETURNING *', [id]);
    return rows[0] ? formatQuiz(rows[0]) : null;
  },
};

function formatQuiz(row) {
  return { _id: row.id, id: row.id, title: row.title, courseId: row.course_id, schoolId: row.school_id, createdBy: row.created_by, duration: row.duration, totalMarks: row.total_marks, passingMarks: row.passing_marks, category: row.category, status: row.status, shuffleQuestions: row.shuffle_questions, shuffleOptions: row.shuffle_options, showResultsImmediately: row.show_results_immediately, attemptLimit: row.attempt_limit, availableFrom: row.available_from, availableTo: row.available_to, questions: [], createdAt: row.created_at };
}

function formatQuestion(row) {
  return { _id: row.id, id: row.id, quizId: row.quiz_id, question: row.question, options: row.options, correctAnswer: row.correct_answer, explanation: row.explanation, imageUrl: row.image_url, points: row.points };
}

module.exports = Quiz;
