const Course = require('../models/Course');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const Quiz = require('../models/Quiz');
const Enrollment = require('../models/Enrollment');
const NodeCache = require('node-cache');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const cache = new NodeCache({ stdTTL: 300 });

// ─── GET /api/v1/courses/public ──────────────────────────────────────────────
const getPublicCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ school_id: null, is_published: true });
    res.json(successResponse('Public courses fetched.', { courses, count: courses.length }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/courses ─────────────────────────────────────────────────────
const getCourses = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const cacheKey = `courses_${req.user.schoolId?._id || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const filter = { is_published: true };
    const isAdmin = ['school_admin', 'super_admin', 'teacher'].includes(req.user.role);
    if (!isAdmin && req.user.schoolId) filter.school_id = req.user.schoolId._id || req.user.schoolId;

    const courses = await Course.find(filter);
    const response = successResponse('Courses fetched.', { courses, count: courses.length });
    cache.set(cacheKey, response);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/courses/:id ─────────────────────────────────────────────────
const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json(errorResponse('Course not found.'));

    if (req.user) {
      const userId = req.user._id || req.user.id;
      const attendance = await Attendance.find({ user_id: userId, course_id: course.id });
      const attendedIds = new Set(attendance.map(a => String(a.lectureId)));
      course.lectures = course.lectures.map(lec => ({
        ...lec,
        completed: attendedIds.has(String(lec._id || lec.id)),
      }));
    }

    res.json(successResponse('Course fetched.', { course }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/courses ────────────────────────────────────────────────────
const createCourse = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const schoolId = req.user.schoolId?._id || req.user.schoolId || req.body.schoolId || req.body.school_id;
    
    if (!schoolId) {
      return res.status(400).json(errorResponse('School assignment is required. Please select a school.'));
    }

    const course = await Course.create({ ...req.body, teacher_id: userId, school_id: schoolId });
    // Clear all course caches
    const keys = cache.keys();
    keys.forEach(k => { if (k.startsWith('courses_')) cache.del(k); });

    // Real-time: notify students in this school of new course
    const targetSchoolId = course.schoolId?._id || req.body.school_id || schoolId;
    if (req.io && targetSchoolId) {
      req.io.to(`school_${targetSchoolId}`).emit('course:created', course);
    }

    res.status(201).json(successResponse('Course created.', { course }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/courses/:id ─────────────────────────────────────────────────
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json(errorResponse('Course not found.'));
    // Clear all course caches
    const keys = cache.keys();
    keys.forEach(k => { if (k.startsWith('courses_')) cache.del(k); });

    // Real-time: notify enrolled students of course update
    if (req.io) {
      req.io.to(`course_${req.params.id}`).emit('course:updated', course);
      const schoolId = course.schoolId?._id || course.schoolId;
      if (schoolId) req.io.to(`school_${schoolId}`).emit('course:updated', course);
    }

    res.json(successResponse('Course updated.', { course }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/courses/:id/lectures ───────────────────────────────────────
const addLecture = async (req, res, next) => {
  try {
    const lecture = await Course.addLecture(req.params.id, req.body);

    // Real-time: notify enrolled students of new lecture
    if (req.io) {
      req.io.to(`course_${req.params.id}`).emit('lecture:added', { courseId: req.params.id, lecture });
    }

    res.status(201).json(successResponse('Lecture added.', { lecture }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/courses/:id/lectures/:lectureId ─────────────────────────────
const updateLecture = async (req, res, next) => {
  try {
    const lecture = await Course.updateLecture(req.params.lectureId, req.body);
    if (!lecture) return res.status(404).json(errorResponse('Lecture not found.'));

    // Real-time: notify enrolled students of lecture update
    if (req.io) {
      req.io.to(`course_${req.params.id}`).emit('lecture:updated', { courseId: req.params.id, lecture });
    }

    res.json(successResponse('Lecture updated.', { lecture }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/courses/home-summary ────────────────────────────────────────
const getHomeSummary = async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user._id || user.id;
    const schoolId = user.schoolId?._id || user.schoolId;

    const enrollments = await Enrollment.find({ user_id: userId, statuses: ['active', 'completed'] });
    const enrolledCourseIds = enrollments.map(e => e.courseId?._id || e.courseId).filter(Boolean);

    const courses = enrolledCourseIds.length > 0
      ? await Course.find({ ids: enrolledCourseIds, is_published: true })
      : [];

    const progressMap = {};
    enrollments.forEach(e => { progressMap[String(e.courseId?._id || e.courseId)] = e.progress; });
    const coursesWithProgress = courses.map(c => ({ ...c, progress: progressMap[String(c.id)] || 0 }));

    const totalCount = await Course.countLectures(enrolledCourseIds.length > 0 ? enrolledCourseIds : []);
    const attendedCount = await Attendance.countDocuments({ user_id: userId, status: 'present' });
    const attendancePercent = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0;

    const announcements = schoolId
      ? await Announcement.find({ school_id: schoolId, is_active: true, limit: 5 })
      : [];

    // Quiz visibility: only show quizzes for enrolled courses (not entire school)
    const upcomingQuizzes = enrolledCourseIds.length > 0
      ? await Quiz.find({ course_ids: enrolledCourseIds, status: 'published', limit: 5 })
      : [];

    res.json(successResponse('Home summary fetched.', {
      user: { name: user.name, avatar: user.avatar, points: user.points, streak: user.streak },
      courses: coursesWithProgress,
      attendance: attendancePercent,
      lessonsCompleted: attendedCount,
      totalLessons: totalCount,
      announcements,
      upcomingQuizzes,
    }));
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/courses/:id ──────────────────────────────────────────────
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json(errorResponse('Course not found.'));
    // Clear all course caches
    const keys = cache.keys();
    keys.forEach(k => { if (k.startsWith('courses_')) cache.del(k); });

    // Real-time: notify of deletion
    if (req.io) {
      req.io.to(`course_${req.params.id}`).emit('course:deleted', { id: req.params.id });
    }

    res.json(successResponse('Course deleted.'));
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/courses/:id/lectures/:lectureId ──────────────────────────
const deleteLecture = async (req, res, next) => {
  try {
    const lecture = await Course.deleteLecture(req.params.lectureId);
    if (!lecture) return res.status(404).json(errorResponse('Lecture not found.'));
    res.json(successResponse('Lecture deleted.'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getPublicCourses, getCourses, getCourse, createCourse, updateCourse, addLecture, updateLecture, getHomeSummary, deleteCourse, deleteLecture };
