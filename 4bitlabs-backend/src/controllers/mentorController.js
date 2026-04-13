const Mentor = require('../models/Mentor');
const MentorBooking = require('../models/MentorBooking');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// ─── GET /api/v1/mentors ─────────────────────────────────────────────────────
const getMentors = async (req, res, next) => {
  try {
    const filter = { is_available: true };
    if (req.query.skill) filter.skill = req.query.skill;
    const mentors = await Mentor.find(filter);
    res.json(successResponse('Mentors fetched.', { mentors, count: mentors.length }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/mentors/:id ─────────────────────────────────────────────────
const getMentor = async (req, res, next) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json(errorResponse('Mentor not found.'));
    res.json(successResponse('Mentor fetched.', { mentor }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/mentors/bookings/my ─────────────────────────────────────────
const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const bookings = await MentorBooking.find({ student_id: userId });
    res.json(successResponse('Bookings fetched.', { bookings, count: bookings.length }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/mentors — admin ────────────────────────────────────────────
const createMentor = async (req, res, next) => {
  try {
    const data = { ...req.body, user_id: req.body.userId, uid: req.body.uid || req.user.uid, name: req.body.name };
    const mentor = await Mentor.create(data);
    res.status(201).json(successResponse('Mentor created.', { mentor }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/mentors/:id ─────────────────────────────────────────────────
const updateMentor = async (req, res, next) => {
  try {
    const mentor = await Mentor.findByIdAndUpdate(req.params.id, req.body);
    if (!mentor) return res.status(404).json(errorResponse('Mentor not found.'));
    res.json(successResponse('Mentor updated.', { mentor }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/mentors/:id/review ─────────────────────────────────────────
const addReview = async (req, res, next) => {
  try {
    const { bookingId, rating, review } = req.body;
    const userId = req.user._id || req.user.id;
    const booking = await MentorBooking.findOneAndUpdate(
      { id: bookingId, student_id: userId, status: 'completed' },
      { rating, review }
    );
    if (!booking) return res.status(404).json(errorResponse('Booking not found or not eligible for review.'));

    const ratingRows = await MentorBooking.findByMentorIdWithRating(booking.mentorId.id || booking.mentorId._id);
    const avgRating = ratingRows.reduce((s, b) => s + b.rating, 0) / ratingRows.length;
    await Mentor.findByIdAndUpdate(booking.mentorId.id || booking.mentorId._id, {
      rating: Math.round(avgRating * 10) / 10,
      review_count: ratingRows.length,
    });

    res.json(successResponse('Review submitted.', { booking }));
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/mentors/:id ──────────────────────────────────────────────
const deleteMentor = async (req, res, next) => {
  try {
    const mentor = await Mentor.findByIdAndDelete(req.params.id);
    if (!mentor) return res.status(404).json(errorResponse('Mentor not found.'));
    res.json(successResponse('Mentor deleted.'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getMentors, getMentor, getMyBookings, createMentor, updateMentor, addReview, deleteMentor };
