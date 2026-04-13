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
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const total = await Enrollment.countDocuments({ course_id: courseId, status: 'active' });
    const enrollments = await Enrollment.find({ course_id: courseId, status: 'active', limit, offset });
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
