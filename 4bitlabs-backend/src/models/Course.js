const { pool } = require('../config/database');

const Course = {
  async find(filter = {}) {
    let q = `SELECT c.*, s.name as school_name, s.code as school_code, u.name as teacher_name, u.avatar as teacher_avatar
             FROM courses c LEFT JOIN schools s ON c.school_id = s.id LEFT JOIN users u ON c.teacher_id = u.id WHERE 1=1`;
    const vals = [];
    let i = 1;
    if (filter.school_id) { q += ` AND c.school_id = $${i++}`; vals.push(filter.school_id); }
    if (filter.is_published !== undefined) { q += ` AND c.is_published = $${i++}`; vals.push(filter.is_published); }
    if (filter.ids && filter.ids.length > 0) {
      q += ` AND c.id = ANY($${i++}::uuid[])`;
      vals.push(filter.ids);
    }
    q += ' ORDER BY c.created_at DESC';
    const { rows } = await pool.query(q, vals);
    return rows.map(formatCourse);
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT c.*, s.name as school_name, s.code as school_code, u.name as teacher_name, u.avatar as teacher_avatar
       FROM courses c LEFT JOIN schools s ON c.school_id = s.id LEFT JOIN users u ON c.teacher_id = u.id WHERE c.id = $1`,
      [id]
    );
    if (!rows[0]) return null;
    const course = formatCourse(rows[0]);
    const { rows: lectures } = await pool.query('SELECT * FROM lectures WHERE course_id = $1 ORDER BY sort_order ASC', [id]);
    course.lectures = lectures.map(formatLecture);
    return course;
  },

  async create(data) {
    const { title, description = '', thumbnail_url = '', school_id, teacher_id, category = 'General', tags = [] } = data;
    const { rows } = await pool.query(
      `INSERT INTO courses (title, description, thumbnail_url, school_id, teacher_id, category, tags) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, description, thumbnail_url, school_id, teacher_id || null, category, tags]
    );
    return formatCourse(rows[0]);
  },

  async findByIdAndUpdate(id, data) {
    const fields = [`updated_at = NOW()`];
    const values = [];
    let idx = 1;
    const map = { title: 'title', description: 'description', thumbnail_url: 'thumbnail_url', category: 'category', is_published: 'is_published', tags: 'tags' };
    for (const [key, col] of Object.entries(map)) {
      if (data[key] !== undefined) { fields.push(`${col} = $${idx++}`); values.push(data[key]); }
    }
    if (data.enrolled_count_inc !== undefined) { fields.push(`enrolled_count = enrolled_count + $${idx++}`); values.push(data.enrolled_count_inc); }
    values.push(id);
    const { rows } = await pool.query(`UPDATE courses SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    return rows[0] ? formatCourse(rows[0]) : null;
  },

  async findByIdAndDelete(id) {
    const { rows } = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING *', [id]);
    return rows[0] ? formatCourse(rows[0]) : null;
  },

  async addLecture(courseId, lectureData) {
    const { title, description = '', video_url = '', duration = '', thumbnail_url = '', sort_order = 0, topic = '', is_published = false } = lectureData;
    const { rows } = await pool.query(
      `INSERT INTO lectures (course_id, title, description, video_url, duration, thumbnail_url, sort_order, topic, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [courseId, title, description, video_url, duration, thumbnail_url, sort_order, topic, is_published]
    );
    return formatLecture(rows[0]);
  },

  async updateLecture(lectureId, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key of ['title', 'description', 'video_url', 'duration', 'topic', 'is_published']) {
      if (data[key] !== undefined) { fields.push(`${key} = $${idx++}`); values.push(data[key]); }
    }
    if (fields.length === 0) return null;
    values.push(lectureId);
    const { rows } = await pool.query(`UPDATE lectures SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    return rows[0] ? formatLecture(rows[0]) : null;
  },

  async deleteLecture(lectureId) {
    const { rows } = await pool.query('DELETE FROM lectures WHERE id = $1 RETURNING *', [lectureId]);
    return rows[0] ? formatLecture(rows[0]) : null;
  },

  async countLectures(courseIds) {
    const { rows } = await pool.query(`SELECT COUNT(*) as total FROM lectures WHERE course_id = ANY($1::uuid[])`, [courseIds]);
    return parseInt(rows[0]?.total || 0);
  },
};

function formatCourse(row) {
  return {
    _id: row.id, id: row.id, title: row.title, description: row.description,
    thumbnailUrl: row.thumbnail_url, schoolId: row.school_id ? { _id: row.school_id, name: row.school_name, code: row.school_code } : null,
    teacherId: row.teacher_id ? { _id: row.teacher_id, name: row.teacher_name, avatar: row.teacher_avatar } : null,
    category: row.category, enrolledCount: row.enrolled_count, isPublished: row.is_published,
    tags: row.tags || [], lectures: [], buildProjects: [], createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function formatLecture(row) {
  return { _id: row.id, id: row.id, courseId: row.course_id, title: row.title, description: row.description, videoUrl: row.video_url, duration: row.duration, thumbnailUrl: row.thumbnail_url, order: row.sort_order, topic: row.topic, isPublished: row.is_published };
}

module.exports = Course;
