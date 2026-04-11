const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// ─── POST /api/v1/enrollments — Student enrolls in a course ─────────────────
const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json(errorResponse('Course not found.'));

    // Check if already enrolled
    const existing = await Enrollment.findOne({ userId: req.user._id, courseId });
    if (existing) {
      return res.status(409).json(errorResponse('Already enrolled in this course.'));
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      userId: req.user._id,
      courseId,
      schoolId: course.schoolId,
    });

    // Add courseId to user's courseIds array
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { courseIds: courseId },
    });

    // Increment enrolled count on course
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });

    res.status(201).json(successResponse('Enrolled successfully.', { enrollment }));
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/enrollments/:courseId — Student unenrolls from a course ──
const unenrollFromCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOneAndUpdate(
      { userId: req.user._id, courseId },
      { status: 'dropped' },
      { new: true }
    );
    if (!enrollment) {
      return res.status(404).json(errorResponse('Enrollment not found.'));
    }

    // Remove courseId from user's courseIds
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { courseIds: courseId },
    });

    // Decrement enrolled count
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: -1 } });

    res.json(successResponse('Unenrolled successfully.'));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/enrollments/my — Student's enrolled courses ────────────────
const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({
      userId: req.user._id,
      status: { $in: ['active', 'completed'] },
    })
      .populate('courseId', 'title description thumbnailUrl category enrolledCount')
      .populate('schoolId', 'name code')
      .sort({ enrolledAt: -1 })
      .lean();

    res.json(successResponse('Enrollments fetched.', { enrollments, count: enrollments.length }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/enrollments/course/:courseId — Teacher views enrolled students
const getCourseEnrollments = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Enrollment.countDocuments({ courseId, status: 'active' });
    const enrollments = await Enrollment.find({ courseId, status: 'active' })
      .populate('userId', 'name email avatar points')
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json(successResponse('Course enrollments fetched.', {
      enrollments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/enrollments/:courseId/progress — Update enrollment progress ─
const updateProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { lectureId } = req.body;

    const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId });
    if (!enrollment) return res.status(404).json(errorResponse('Enrollment not found.'));

    // Add lecture to completed list if not already there
    if (lectureId && !enrollment.completedLectures.includes(lectureId)) {
      enrollment.completedLectures.push(lectureId);
    }

    // Calculate progress percentage
    const course = await Course.findById(courseId).select('lectures');
    if (course && course.lectures.length > 0) {
      enrollment.progress = Math.round(
        (enrollment.completedLectures.length / course.lectures.length) * 100
      );
    }

    enrollment.lastAccessedAt = new Date();

    // Mark as completed if 100%
    if (enrollment.progress >= 100) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    }

    await enrollment.save();
    res.json(successResponse('Progress updated.', { enrollment }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollInCourse,
  unenrollFromCourse,
  getMyEnrollments,
  getCourseEnrollments,
  updateProgress,
};
