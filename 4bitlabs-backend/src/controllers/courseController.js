const Course = require('../models/Course');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const Quiz = require('../models/Quiz');
const Enrollment = require('../models/Enrollment');
const NodeCache = require('node-cache');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const cache = new NodeCache({ stdTTL: 300 }); // 5-minute cache

// ─── GET /api/v1/courses ────────────────────────────────────────────────────
// Students see courses from their school; admins see all
const getCourses = async (req, res, next) => {
  try {
    const cacheKey = `courses_${req.user.schoolId || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const filter = ['school_admin', 'super_admin', 'teacher'].includes(req.user.role)
      ? { isPublished: true }
      : { schoolId: req.user.schoolId, isPublished: true };

    const courses = await Course.find(filter)
      .select('title description thumbnailUrl category enrolledCount tags')
      .populate('schoolId', 'name code')
      .populate('teacherId', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

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
    const course = await Course.findById(req.params.id)
      .populate('schoolId', 'name code')
      .populate('teacherId', 'name avatar')
      .lean();
    if (!course) return res.status(404).json(errorResponse('Course not found.'));

    // Attach user progress for each lecture
    if (req.user) {
      const attendance = await Attendance.find({
        userId: req.user._id,
        courseId: course._id,
      }).select('lectureId status').lean();

      const attendedIds = new Set(attendance.map((a) => String(a.lectureId)));
      course.lectures = course.lectures.map((lec) => ({
        ...lec,
        completed: attendedIds.has(String(lec._id)),
      }));
    }

    res.json(successResponse('Course fetched.', { course }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/courses — teacher/admin ────────────────────────────────────
const createCourse = async (req, res, next) => {
  try {
    const course = await Course.create({
      ...req.body,
      teacherId: req.user._id,
      schoolId: req.body.schoolId || req.user.schoolId,
    });
    // Clear cache
    cache.del(`courses_${course.schoolId}`);
    res.status(201).json(successResponse('Course created.', { course }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/courses/:id — teacher/admin ─────────────────────────────────
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json(errorResponse('Course not found.'));
    cache.del(`courses_${course.schoolId}`);
    res.json(successResponse('Course updated.', { course }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/courses/:id/lectures — teacher/admin ───────────────────────
const addLecture = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json(errorResponse('Course not found.'));
    course.lectures.push(req.body);
    await course.save();
    const lecture = course.lectures[course.lectures.length - 1];
    res.status(201).json(successResponse('Lecture added.', { lecture }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/courses/:id/lectures/:lectureId — teacher/admin ─────────────
const updateLecture = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json(errorResponse('Course not found.'));
    const lecture = course.lectures.id(req.params.lectureId);
    if (!lecture) return res.status(404).json(errorResponse('Lecture not found.'));
    Object.assign(lecture, req.body);
    await course.save();
    res.json(successResponse('Lecture updated.', { lecture }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/courses/home-summary ────────────────────────────────────────
// Dashboard summary for the logged-in student
const getHomeSummary = async (req, res, next) => {
  try {
    const user = req.user;

    // Enrolled courses with progress
    const enrollments = await Enrollment.find({
      userId: user._id,
      status: 'active',
    }).select('courseId progress').lean();

    const enrolledCourseIds = enrollments.map((e) => e.courseId);
    const fallbackIds = enrolledCourseIds.length > 0 ? enrolledCourseIds : user.courseIds || [];

    const courses = await Course.find({
      _id: { $in: fallbackIds },
      isPublished: true,
    }).select('title thumbnailUrl category').lean();

    // Attach progress to each course
    const progressMap = {};
    enrollments.forEach((e) => { progressMap[String(e.courseId)] = e.progress; });
    const coursesWithProgress = courses.map((c) => ({
      ...c,
      progress: progressMap[String(c._id)] || 0,
    }));

    // Attendance percentage across all enrolled courses
    const totalLectures = await Course.aggregate([
      { $match: { _id: { $in: fallbackIds } } },
      { $project: { lectureCount: { $size: '$lectures' } } },
      { $group: { _id: null, total: { $sum: '$lectureCount' } } },
    ]);
    const totalCount = totalLectures[0]?.total || 0;
    const attendedCount = await Attendance.countDocuments({
      userId: user._id,
      status: 'present',
    });
    const attendancePercent = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0;

    // Recent announcements for the student's school
    const announcements = await Announcement.find({
      $or: [
        { schoolId: user.schoolId },
        { schoolId: { $exists: false } },
      ],
      isActive: true,
      $and: [
        { $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }] },
      ],
    })
      .select('title body type imageUrl isPinned createdAt')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(5)
      .lean();

    // Upcoming quizzes (published, not yet attempted)
    const upcomingQuizzes = await Quiz.find({
      schoolId: user.schoolId,
      status: 'published',
      courseId: { $in: fallbackIds },
    })
      .select('title courseId duration totalMarks availableFrom')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json(
      successResponse('Home summary fetched.', {
        user: {
          name: user.name,
          avatar: user.avatar,
          points: user.points,
          streak: user.streak,
        },
        courses: coursesWithProgress,
        attendance: attendancePercent,
        lessonsCompleted: attendedCount,
        totalLessons: totalCount,
        announcements,
        upcomingQuizzes,
      })
    );
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/courses/:id — teacher/admin ──────────────────────────────
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json(errorResponse('Course not found.'));
    cache.del(`courses_${course.schoolId}`);
    cache.del('courses_all');
    res.json(successResponse('Course deleted.'));
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/courses/:id/lectures/:lectureId — teacher/admin ──────────
const deleteLecture = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json(errorResponse('Course not found.'));
    const lecture = course.lectures.id(req.params.lectureId);
    if (!lecture) return res.status(404).json(errorResponse('Lecture not found.'));
    lecture.deleteOne();
    await course.save();
    res.json(successResponse('Lecture deleted.'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getCourses, getCourse, createCourse, updateCourse, addLecture, updateLecture, getHomeSummary, deleteCourse, deleteLecture };
