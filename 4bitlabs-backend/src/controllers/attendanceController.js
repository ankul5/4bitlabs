const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// ─── POST /api/v1/attendance — Mark attendance for a lecture ─────────────────
const markAttendance = async (req, res, next) => {
  try {
    const { courseId, lectureId, watchedDurationSeconds } = req.body;
    if (!courseId || !lectureId) {
      return res.status(400).json(errorResponse('courseId and lectureId are required.'));
    }

    const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

    // Verify the lecture exists in the course
    const course = await Course.findById(courseId).select('lectures schoolId');
    if (!course) return res.status(404).json(errorResponse('Course not found.'));
    const lectureExists = course.lectures.id(lectureId);
    if (!lectureExists) return res.status(404).json(errorResponse('Lecture not found in this course.'));

    // Upsert — update if already marked, otherwise create
    const attendance = await Attendance.findOneAndUpdate(
      { userId: req.user._id, lectureId },
      {
        userId: req.user._id,
        courseId,
        lectureId,
        schoolId: course.schoolId,
        date: today,
        status: 'present',
        watchedDurationSeconds: watchedDurationSeconds || 0,
        markedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(successResponse('Attendance marked.', { attendance }));
  } catch (error) {
    if (error.code === 11000) {
      // Already exists — not an error for the client
      return res.json(successResponse('Attendance already marked for this lecture.'));
    }
    next(error);
  }
};

// ─── GET /api/v1/attendance/my ───────────────────────────────────────────────
const getMyAttendance = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    const filter = { userId: req.user._id };
    if (courseId) filter.courseId = courseId;

    const attendance = await Attendance.find(filter)
      .select('courseId lectureId date status watchedDurationSeconds')
      .sort({ date: -1 })
      .lean();

    // Compute summary per course
    const summaryMap = {};
    attendance.forEach((a) => {
      const cid = String(a.courseId);
      if (!summaryMap[cid]) summaryMap[cid] = { present: 0, total: 0 };
      summaryMap[cid].total++;
      if (a.status === 'present') summaryMap[cid].present++;
    });
    const summary = Object.entries(summaryMap).map(([cid, s]) => ({
      courseId: cid,
      present: s.present,
      total: s.total,
      percentage: Math.round((s.present / s.total) * 100),
    }));

    res.json(successResponse('Attendance fetched.', { attendance, summary, count: attendance.length }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/attendance/course/:courseId — teacher view ──────────────────
const getCourseAttendance = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { date } = req.query; // optional filter by date

    const filter = { courseId };
    if (date) filter.date = date;

    const attendance = await Attendance.find(filter)
      .populate('userId', 'name avatar email')
      .sort({ date: -1 })
      .lean();

    res.json(successResponse('Course attendance fetched.', { attendance, count: attendance.length }));
  } catch (error) {
    next(error);
  }
};

module.exports = { markAttendance, getMyAttendance, getCourseAttendance };
