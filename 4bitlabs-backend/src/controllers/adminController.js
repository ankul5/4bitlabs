const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const User = require('../models/User');
const School = require('../models/School');

// ─── PUT /api/v1/admin/users/:id/points ─────────────────────────────────────
const manuallyUpdatePoints = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { points, reason } = req.body; // e.g. add 50 points or -10 points

    const parsedPoints = parseInt(points, 10);
    if (isNaN(parsedPoints)) return res.status(400).json(errorResponse('Invalid points value.'));

    await User.incrementPoints(id, parsedPoints);

    // Track the reason (optional feature)
    // Could track via a 'point_ledgers' table, but for now we just return success
    
    // Attempt to update leaderboard entry globally (fetch max points)
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (rows.length > 0) {
      const u = rows[0];
      if (req.io) {
        req.io.emit('leaderboard:refresh'); // Trigger global refresh for real-time
      }
      return res.json(successResponse('Points updated successfully.', { userId: id, newTotalPoints: u.points }));
    }

    res.json(successResponse('Points updated successfully.', { } ));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/admin/attendance/:id/override ──────────────────────────────
const overrideAttendance = async (req, res, next) => {
  try {
    const { id } = req.params; // attendance record ID
    const { status, remarks } = req.body; // 'present' or 'absent'

    if (!['present', 'absent'].includes(status)) {
      return res.status(400).json(errorResponse('Status must be present or absent.'));
    }

    const { rows } = await pool.query(
      `UPDATE attendance SET status = $1, remarks = $2 WHERE id = $3 RETURNING *`,
      [status, remarks || 'Mentor Manual Override', id]
    );

    if (rows.length === 0) return res.status(404).json(errorResponse('Attendance record not found.'));

    res.json(successResponse('Attendance overridden successfully.', { record: rows[0] }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/admin/school-stats ──────────────────────────────────────────
const getSchoolStats = async (req, res, next) => {
  try {
    // Get all active schools
    const schools = await School.find({ is_active: true });

    // Get student count per school
    const { rows: studentCounts } = await pool.query(
      `SELECT school_id, COUNT(*) as student_count
       FROM users WHERE role = 'student' AND school_id IS NOT NULL
       GROUP BY school_id`
    );
    const studentCountMap = {};
    studentCounts.forEach(r => { studentCountMap[r.school_id] = parseInt(r.student_count); });

    // Get courses per school with enrollment counts
    const { rows: coursesWithEnrollments } = await pool.query(
      `SELECT c.id as course_id, c.title as course_title, c.school_id,
              COUNT(DISTINCT e.user_id) as enrolled_count
       FROM courses c
       LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'active'
       WHERE c.is_published = true
       GROUP BY c.id, c.title, c.school_id
       ORDER BY c.title ASC`
    );

    // Group courses by school
    const coursesBySchool = {};
    coursesWithEnrollments.forEach(r => {
      if (!coursesBySchool[r.school_id]) coursesBySchool[r.school_id] = [];
      coursesBySchool[r.school_id].push({
        id: r.course_id,
        title: r.course_title,
        enrolledCount: parseInt(r.enrolled_count) || 0,
      });
    });

    // Build response
    const schoolStats = schools.map(s => ({
      id: s.id || s._id,
      name: s.name,
      code: s.code,
      studentCount: studentCountMap[s.id || s._id] || 0,
      courses: coursesBySchool[s.id || s._id] || [],
    }));

    // Grand totals
    const totalStudents = Object.values(studentCountMap).reduce((a, b) => a + b, 0);
    const totalCourses = coursesWithEnrollments.length;

    res.json(successResponse('School stats fetched.', {
      schools: schoolStats,
      totalStudents,
      totalSchools: schools.length,
      totalCourses,
    }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/admin/dashboard-stats ───────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    // Run all count queries in parallel for performance
    const [studentsRes, coursesRes, schoolsRes, quizzesRes, recentRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) as count FROM users WHERE role = 'student'`),
      pool.query(`SELECT COUNT(*) as count FROM courses WHERE is_published = true`),
      pool.query(`SELECT COUNT(*) as count FROM schools WHERE is_active = true`),
      pool.query(`SELECT COUNT(*) as count FROM quizzes WHERE status = 'published'`),
      pool.query(
        `SELECT u.id, u.name, u.email, u.avatar, u.created_at, u.school_id,
                s.name as school_name, s.code as school_code
         FROM users u
         LEFT JOIN schools s ON u.school_id = s.id
         WHERE u.role = 'student'
         ORDER BY u.created_at DESC
         LIMIT 5`
      ),
    ]);

    res.json(successResponse('Dashboard stats fetched.', {
      totalStudents: parseInt(studentsRes.rows[0]?.count || 0),
      totalCourses: parseInt(coursesRes.rows[0]?.count || 0),
      totalSchools: parseInt(schoolsRes.rows[0]?.count || 0),
      totalQuizzes: parseInt(quizzesRes.rows[0]?.count || 0),
      recentStudents: recentRes.rows.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        avatar: r.avatar,
        created_at: r.created_at,
        school_name: r.school_name || 'No School',
        school_code: r.school_code || '',
      })),
    }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  manuallyUpdatePoints,
  overrideAttendance,
  getSchoolStats,
  getDashboardStats,
};
