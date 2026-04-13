const { pool } = require('../config/database');

const Leaderboard = {
  async findOne(filter = {}) {
    if (filter.course_id) {
      const { rows } = await pool.query(
        'SELECT * FROM leaderboard_entries WHERE course_id = $1 ORDER BY points DESC',
        [filter.course_id]
      );
      if (rows.length === 0) return null;
      return { courseId: filter.course_id, entries: rows.map(formatEntry), lastRecalculated: rows[0]?.last_updated };
    }
    return null;
  },

  async find(filter = {}) {
    // Returns leaderboards for given course IDs where a specific user appears
    if (filter.course_ids && filter.user_id) {
      const { rows } = await pool.query(
        `SELECT le.*, c.title as course_title FROM leaderboard_entries le LEFT JOIN courses c ON le.course_id = c.id WHERE le.course_id = ANY($1::uuid[]) AND le.user_id = $2`,
        [filter.course_ids, filter.user_id]
      );
      return rows.map(row => ({ courseId: { _id: row.course_id, title: row.course_title }, entries: [formatEntry(row)] }));
    }
    return [];
  },

  async upsertEntry(courseId, schoolId, userId, data) {
    const { uid = '', name = '', avatar = '', schoolName = '', points = 0, quizzesCompleted = 1 } = data;
    // Upsert leaderboard entry
    await pool.query(
      `INSERT INTO leaderboard_entries (course_id, school_id, user_id, uid, name, avatar, school_name, points, quizzes_completed, last_updated)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
       ON CONFLICT (course_id, user_id) DO UPDATE SET
         points = leaderboard_entries.points + EXCLUDED.points,
         quizzes_completed = leaderboard_entries.quizzes_completed + 1,
         name = EXCLUDED.name, avatar = EXCLUDED.avatar, last_updated = NOW()`,
      [courseId, schoolId, userId, uid, name, avatar, schoolName, points, quizzesCompleted]
    );
    // Recalculate ranks
    await pool.query(`
      UPDATE leaderboard_entries le SET rank = sub.new_rank
      FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY points DESC) as new_rank FROM leaderboard_entries WHERE course_id = $1) sub
      WHERE le.id = sub.id AND le.course_id = $1
    `, [courseId]);
  },

  async addPointsToEntry(courseId, userId, points) {
    await pool.query(
      `INSERT INTO leaderboard_entries (course_id, user_id, points) VALUES ($1,$2,$3)
       ON CONFLICT (course_id, user_id) DO UPDATE SET points = leaderboard_entries.points + $3, last_updated = NOW()`,
      [courseId, userId, points]
    );
    await pool.query(`
      UPDATE leaderboard_entries le SET rank = sub.new_rank
      FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY points DESC) as new_rank FROM leaderboard_entries WHERE course_id = $1) sub
      WHERE le.id = sub.id AND le.course_id = $1
    `, [courseId]);
  },

  async getEntry(courseId, userId) {
    const { rows } = await pool.query('SELECT * FROM leaderboard_entries WHERE course_id = $1 AND user_id = $2', [courseId, userId]);
    return rows[0] ? formatEntry(rows[0]) : null;
  },
};

function formatEntry(row) {
  return { _id: row.id, id: row.id, userId: row.user_id, uid: row.uid, name: row.name, avatar: row.avatar, schoolName: row.school_name, points: row.points, rank: row.rank, quizzesCompleted: row.quizzes_completed, lastUpdated: row.last_updated };
}

module.exports = Leaderboard;
