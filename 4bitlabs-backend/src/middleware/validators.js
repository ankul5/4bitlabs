const { body, param, query } = require('express-validator');

// ─── Course Validators ────────────────────────────────────────────────────────
const createCourseValidation = [
  body('title').notEmpty().trim().withMessage('Course title is required.'),
  body('schoolId').notEmpty().isMongoId().withMessage('Valid schoolId is required.'),
  body('description').optional().trim(),
  body('category').optional().trim(),
];

const updateCourseValidation = [
  param('id').isMongoId().withMessage('Valid course ID is required.'),
  body('title').optional().trim(),
  body('description').optional().trim(),
];

const addLectureValidation = [
  param('id').isMongoId().withMessage('Valid course ID is required.'),
  body('title').notEmpty().trim().withMessage('Lecture title is required.'),
  body('videoUrl').optional().trim(),
  body('duration').optional().trim(),
];

// ─── Quiz Validators ─────────────────────────────────────────────────────────
const createQuizValidation = [
  body('title').notEmpty().trim().withMessage('Quiz title is required.'),
  body('courseId').notEmpty().isMongoId().withMessage('Valid courseId is required.'),
  body('schoolId').notEmpty().isMongoId().withMessage('Valid schoolId is required.'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required.'),
  body('questions.*.question').notEmpty().withMessage('Question text is required.'),
  body('questions.*.options').isArray({ min: 2 }).withMessage('At least 2 options are required.'),
  body('questions.*.correctAnswer').notEmpty().withMessage('Correct answer is required.'),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer (minutes).'),
];

const submitQuizValidation = [
  param('id').isMongoId().withMessage('Valid quiz ID is required.'),
  body('answers').isArray({ min: 1 }).withMessage('Answers array is required.'),
  body('answers.*.questionId').notEmpty().withMessage('questionId is required for each answer.'),
  body('answers.*.selectedAnswer').notEmpty().withMessage('selectedAnswer is required for each answer.'),
  body('timeTakenSeconds').optional().isInt({ min: 0 }).withMessage('timeTakenSeconds must be non-negative.'),
];

const addManualPointsValidation = [
  body('studentId').notEmpty().isMongoId().withMessage('Valid studentId is required.'),
  body('courseId').notEmpty().isMongoId().withMessage('Valid courseId is required.'),
  body('points').notEmpty().isInt({ min: 1 }).withMessage('Points must be a positive integer.'),
];

// ─── Attendance Validators ───────────────────────────────────────────────────
const markAttendanceValidation = [
  body('courseId').notEmpty().isMongoId().withMessage('Valid courseId is required.'),
  body('lectureId').notEmpty().isMongoId().withMessage('Valid lectureId is required.'),
  body('watchedDurationSeconds').optional().isInt({ min: 0 }).withMessage('watchedDurationSeconds must be non-negative.'),
];

// ─── Payment Validators ─────────────────────────────────────────────────────
const createOrderValidation = [
  body('mentorId').notEmpty().isMongoId().withMessage('Valid mentorId is required.'),
  body('slot').notEmpty().withMessage('Slot is required.'),
  body('slot.date').notEmpty().withMessage('Slot date is required.'),
  body('slot.time').notEmpty().withMessage('Slot time is required.'),
];

const verifyPaymentValidation = [
  body('razorpay_order_id').notEmpty().withMessage('razorpay_order_id is required.'),
  body('razorpay_payment_id').notEmpty().withMessage('razorpay_payment_id is required.'),
  body('razorpay_signature').notEmpty().withMessage('razorpay_signature is required.'),
  body('bookingId').notEmpty().isMongoId().withMessage('Valid bookingId is required.'),
];

// ─── Mentor Validators ───────────────────────────────────────────────────────
const createMentorValidation = [
  body('userId').notEmpty().isMongoId().withMessage('Valid userId is required.'),
  body('uid').notEmpty().withMessage('Firebase UID is required.'),
  body('name').notEmpty().trim().withMessage('Mentor name is required.'),
  body('bio').optional().trim(),
  body('sessionPrice').optional().isInt({ min: 0 }).withMessage('Session price must be non-negative.'),
];

const addReviewValidation = [
  body('bookingId').notEmpty().isMongoId().withMessage('Valid bookingId is required.'),
  body('rating').notEmpty().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
  body('review').optional().trim(),
];

// ─── School Validators ───────────────────────────────────────────────────────
const createSchoolValidation = [
  body('name').notEmpty().trim().withMessage('School name is required.'),
  body('code').notEmpty().trim().toUpperCase().withMessage('School code is required.'),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
];

// ─── Enrollment Validators ───────────────────────────────────────────────────
const enrollValidation = [
  body('courseId').notEmpty().isMongoId().withMessage('Valid courseId is required.'),
];

// ─── Announcement Validators ────────────────────────────────────────────────
const createAnnouncementValidation = [
  body('title').notEmpty().trim().withMessage('Announcement title is required.'),
  body('body').notEmpty().withMessage('Announcement body is required.'),
  body('type').optional().isIn(['general', 'quiz', 'course', 'event', 'maintenance', 'urgent']).withMessage('Invalid announcement type.'),
  body('schoolId').optional().isMongoId().withMessage('Valid schoolId is required.'),
  body('courseId').optional().isMongoId().withMessage('Valid courseId is required.'),
];

// ─── User Management Validators ────────────────────────────────────────────
const updateUserRoleValidation = [
  param('id').isMongoId().withMessage('Valid user ID is required.'),
  body('role').notEmpty().isIn(['student', 'mentor', 'teacher', 'school_admin', 'super_admin']).withMessage('Invalid role.'),
];

// ─── Generic Validation Result Handler ──────────────────────────────────────
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = {
  validate,
  createCourseValidation,
  updateCourseValidation,
  addLectureValidation,
  createQuizValidation,
  submitQuizValidation,
  addManualPointsValidation,
  markAttendanceValidation,
  createOrderValidation,
  verifyPaymentValidation,
  createMentorValidation,
  addReviewValidation,
  createSchoolValidation,
  enrollValidation,
  createAnnouncementValidation,
  updateUserRoleValidation,
};
