const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// ─── POST /api/v1/attendance ─────────────────────────────────────────────────
const markAttendance = async (req, res, next) => {
  try {
    const { courseId, lectureId, watchedDurationSeconds } = req.body;
    if (!courseId || !lectureId) {
      return res.status(400).json(errorResponse('courseId and lectureId are required.'));
    }
    const userId = req.user._id || req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json(errorResponse('Course not found.'));

    const schoolId = course.schoolId?._id || course.schoolId;
    const attendance = await Attendance.create({
      user_id: userId, course_id: courseId, lecture_id: lectureId,
      school_id: schoolId, date: today, status: 'present',
      watched_duration_seconds: watchedDurationSeconds || 0,
    });

    res.json(successResponse('Attendance marked.', { attendance }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/attendance/my ───────────────────────────────────────────────
const getMyAttendance = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const filter = { user_id: userId };
    if (req.query.courseId) filter.course_id = req.query.courseId;

    const attendance = await Attendance.find(filter);

    const summaryMap = {};
    attendance.forEach(a => {
      const cid = String(a.courseId);
      if (!summaryMap[cid]) summaryMap[cid] = { present: 0, total: 0 };
      summaryMap[cid].total++;
      if (a.status === 'present') summaryMap[cid].present++;
    });
    const summary = Object.entries(summaryMap).map(([cid, s]) => ({
      courseId: cid, present: s.present, total: s.total,
      percentage: Math.round((s.present / s.total) * 100),
    }));

    res.json(successResponse('Attendance fetched.', { attendance, summary, count: attendance.length }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/attendance/course/:courseId ─────────────────────────────────
const getCourseAttendance = async (req, res, next) => {
  try {
    const filter = { course_id: req.params.courseId };
    if (req.query.date) filter.date = req.query.date;
    const attendance = await Attendance.find(filter);
    res.json(successResponse('Course attendance fetched.', { attendance, count: attendance.length }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/attendance/mark-student — Mentor marks attendance for a student
const markStudentAttendance = async (req, res, next) => {
  try {
    const { userId, courseId, status } = req.body;
    if (!userId || !courseId || !status) {
      return res.status(400).json(errorResponse('userId, courseId, and status are required.'));
    }
    if (!['present', 'absent'].includes(status)) {
      return res.status(400).json(errorResponse('Status must be present or absent.'));
    }
    const today = new Date().toISOString().split('T')[0];
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json(errorResponse('Course not found.'));
    const schoolId = course.schoolId?._id || course.schoolId;

    const attendance = await Attendance.create({
      user_id: userId, course_id: courseId, lecture_id: null,
      school_id: schoolId, date: today, status,
      watched_duration_seconds: 0,
    });

    res.json(successResponse(`Attendance marked as ${status}.`, { attendance }));
  } catch (error) {
    next(error);
  }
};

module.exports = { markAttendance, getMyAttendance, getCourseAttendance, markStudentAttendance };
