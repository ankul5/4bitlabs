const School = require('../models/School');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// ─── GET /api/v1/schools ────────────────────────────────────────────────────
// Public — used in registration dropdown
const getSchools = async (req, res, next) => {
  try {
    const schools = await School.find({ isActive: true })
      .select('name code city state logo studentCount')
      .sort({ name: 1 })
      .lean();
    res.json(successResponse('Schools fetched.', { schools, count: schools.length }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/schools/:id ─────────────────────────────────────────────────
const getSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.id)
      .populate('courses', 'title thumbnailUrl enrolledCount')
      .lean();
    if (!school) return res.status(404).json(errorResponse('School not found.'));
    res.json(successResponse('School fetched.', { school }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/schools — admin only ───────────────────────────────────────
const createSchool = async (req, res, next) => {
  try {
    const { name, code, address, city, state } = req.body;
    const school = await School.create({ name, code, address, city, state, adminId: req.user._id });
    res.status(201).json(successResponse('School created.', { school }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/schools/:id — admin only ────────────────────────────────────
const updateSchool = async (req, res, next) => {
  try {
    const school = await School.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!school) return res.status(404).json(errorResponse('School not found.'));
    res.json(successResponse('School updated.', { school }));
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/schools/:id — super admin only ──────────────────────────
const deleteSchool = async (req, res, next) => {
  try {
    const school = await School.findByIdAndDelete(req.params.id);
    if (!school) return res.status(404).json(errorResponse('School not found.'));
    res.json(successResponse('School deleted.'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getSchools, getSchool, createSchool, updateSchool, deleteSchool };
