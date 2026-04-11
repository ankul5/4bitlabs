const Mentor = require('../models/Mentor');
const MentorBooking = require('../models/MentorBooking');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// ─── GET /api/v1/mentors ─────────────────────────────────────────────────────
const getMentors = async (req, res, next) => {
  try {
    const filter = { isAvailable: true };
    if (req.query.skill) {
      filter.skills = { $in: [new RegExp(req.query.skill, 'i')] };
    }

    const mentors = await Mentor.find(filter)
      .select('name avatar role bio skills rating reviewCount sessionPrice isVerified availableSlots')
      .sort({ rating: -1, reviewCount: -1 })
      .lean();

    res.json(successResponse('Mentors fetched.', { mentors, count: mentors.length }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/mentors/:id ─────────────────────────────────────────────────
const getMentor = async (req, res, next) => {
  try {
    const mentor = await Mentor.findById(req.params.id).lean();
    if (!mentor) return res.status(404).json(errorResponse('Mentor not found.'));
    res.json(successResponse('Mentor fetched.', { mentor }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/mentors/bookings/my ─────────────────────────────────────────
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await MentorBooking.find({ studentId: req.user._id })
      .populate('mentorId', 'name avatar role')
      .sort({ createdAt: -1 })
      .lean();
    res.json(successResponse('Bookings fetched.', { bookings, count: bookings.length }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/mentors — admin — Create Mentor Profile ───────────────────
const createMentor = async (req, res, next) => {
  try {
    const mentor = await Mentor.create(req.body);
    res.status(201).json(successResponse('Mentor created.', { mentor }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/mentors/:id — admin/mentor — Update Mentor Profile ──────────
const updateMentor = async (req, res, next) => {
  try {
    const mentor = await Mentor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!mentor) return res.status(404).json(errorResponse('Mentor not found.'));
    res.json(successResponse('Mentor updated.', { mentor }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/mentors/:id/review ─────────────────────────────────────────
// Student rates and reviews mentor after completed session
const addReview = async (req, res, next) => {
  try {
    const { bookingId, rating, review } = req.body;
    const booking = await MentorBooking.findOneAndUpdate(
      { _id: bookingId, studentId: req.user._id, status: 'completed' },
      { rating, review },
      { new: true }
    );
    if (!booking) return res.status(404).json(errorResponse('Booking not found or not eligible for review.'));

    // Update mentor's average rating
    const mentorBookings = await MentorBooking.find({
      mentorId: booking.mentorId,
      rating: { $exists: true, $ne: null },
    }).select('rating');
    const avgRating = mentorBookings.reduce((s, b) => s + b.rating, 0) / mentorBookings.length;
    await Mentor.findByIdAndUpdate(booking.mentorId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: mentorBookings.length,
    });

    res.json(successResponse('Review submitted.', { booking }));
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/mentors/:id — admin deletes mentor ──────────────────────
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
