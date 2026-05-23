const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// ─── POST /api/v1/enrollments ────────────────────────────────────────────────
const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id || req.user.id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json(errorResponse('Course not found.'));

    const existing = await Enrollment.findOne({ user_id: userId, course_id: courseId });
    if (existing) return res.status(409).json(errorResponse('Already enrolled.'));

    const schoolId = course.schoolId?._id || course.schoolId;
    const enrollment = await Enrollment.create({ user_id: userId, course_id: courseId, school_id: schoolId });

    // Track in user_courses join table
    await pool.query(
      'INSERT INTO user_courses (user_id, course_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [userId, courseId]
    );
    await Course.findByIdAndUpdate(courseId, { enrolled_count_inc: 1 });

    res.status(201).json(successResponse('Enrolled successfully.', { enrollment }));
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/enrollments/:courseId ────────────────────────────────────
const unenrollFromCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id || req.user.id;
    const enrollment = await Enrollment.findOneAndUpdate(
      { user_id: userId, course_id: courseId },
      { status: 'dropped' }
    );
    if (!enrollment) return res.status(404).json(errorResponse('Enrollment not found.'));
    await pool.query('DELETE FROM user_courses WHERE user_id=$1 AND course_id=$2', [userId, courseId]);
    await Course.findByIdAndUpdate(courseId, { enrolled_count_inc: -1 });
    res.json(successResponse('Unenrolled successfully.'));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/enrollments/my ──────────────────────────────────────────────
const getMyEnrollments = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const enrollments = await Enrollment.find({ user_id: userId, statuses: ['active', 'completed'] });
    res.json(successResponse('Enrollments fetched.', { enrollments, count: enrollments.length }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/enrollments/course/:courseId ────────────────────────────────
const getCourseEnrollments = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const total = await Enrollment.countDocuments({ course_id: courseId, status: 'active' });

    // Fetch enrollments with student + school info
    const { rows } = await pool.query(
      `SELECT e.*, u.name as student_name, u.email as student_email, u.avatar as student_avatar, u.phone as student_phone,
              s.name as school_name, s.code as school_code, u.created_at as student_joined
       FROM enrollments e
       LEFT JOIN users u ON e.user_id = u.id
       LEFT JOIN schools s ON u.school_id = s.id
       WHERE e.course_id = $1 AND e.status = 'active'
       ORDER BY e.enrolled_at DESC
       LIMIT $2 OFFSET $3`,
      [courseId, limit, offset]
    );

    const enrollments = rows.map(r => ({
      id: r.id, _id: r.id,
      userId: r.user_id,
      courseId: r.course_id,
      status: r.status,
      enrolledAt: r.enrolled_at,
      progress: parseFloat(r.progress) || 0,
      student: {
        id: r.user_id,
        name: r.student_name,
        email: r.student_email,
        avatar: r.student_avatar,
        phone: r.student_phone,
        joinedAt: r.student_joined,
        school: r.school_name ? { name: r.school_name, code: r.school_code } : null,
      },
    }));

    res.json(successResponse('Course enrollments fetched.', { enrollments, total, page, totalPages: Math.ceil(total / limit) }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/enrollments/:courseId/progress ──────────────────────────────
const updateProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { lectureId } = req.body;
    const userId = req.user._id || req.user.id;

    const enrollment = await Enrollment.findOne({ user_id: userId, course_id: courseId });
    if (!enrollment) return res.status(404).json(errorResponse('Enrollment not found.'));

    const completedLectures = enrollment.completedLectures || [];
    if (lectureId && !completedLectures.includes(lectureId)) {
      completedLectures.push(lectureId);
    }

    const course = await Course.findById(courseId);
    const totalLectures = course?.lectures?.length || 0;
    const progress = totalLectures > 0 ? Math.round((completedLectures.length / totalLectures) * 100) : 0;

    const updateData = { completed_lectures: completedLectures, progress, last_accessed_at: new Date() };
    if (progress >= 100) { updateData.status = 'completed'; updateData.completed_at = new Date(); }

    const updated = await Enrollment.findOneAndUpdate({ user_id: userId, course_id: courseId }, updateData);
    res.json(successResponse('Progress updated.', { enrollment: updated }));
  } catch (error) {
    next(error);
  }
};

module.exports = { enrollInCourse, unenrollFromCourse, getMyEnrollments, getCourseEnrollments, updateProgress };
