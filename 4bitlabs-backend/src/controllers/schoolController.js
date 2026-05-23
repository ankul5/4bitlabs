const School = require('../models/School');
const Course = require('../models/Course');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// ─── GET /api/v1/schools ─────────────────────────────────────────────────────
const getSchools = async (req, res, next) => {
  try {
    const schools = await School.find({ is_active: true });
    res.json(successResponse('Schools fetched.', { schools, count: schools.length }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/schools/:id ─────────────────────────────────────────────────
const getSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json(errorResponse('School not found.'));
    
    // Fetch courses for this school so registration form dropdown populates correctly
    const courses = await Course.find({ school_id: school.id, is_published: true });
    school.courses = courses;

    res.json(successResponse('School fetched.', { school }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/schools ────────────────────────────────────────────────────
const createSchool = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, code, address, city, state } = req.body;
    const school = await School.create({ name, code, address, city, state, admin_id: userId });

    // Real-time: notify all clients of new school (for registration dropdowns)
    if (req.io) req.io.to('global').emit('school:created', school);

    res.status(201).json(successResponse('School created.', { school }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/schools/:id ─────────────────────────────────────────────────
const updateSchool = async (req, res, next) => {
  try {
    const school = await School.findByIdAndUpdate(req.params.id, req.body);
    if (!school) return res.status(404).json(errorResponse('School not found.'));

    // Real-time: notify school members of update
    if (req.io) {
      req.io.to(`school_${req.params.id}`).emit('school:updated', school);
      req.io.to('global').emit('school:updated', school);
    }

    res.json(successResponse('School updated.', { school }));
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/schools/:id ──────────────────────────────────────────────
const deleteSchool = async (req, res, next) => {
  try {
    const school = await School.findByIdAndDelete(req.params.id);
    if (!school) return res.status(404).json(errorResponse('School not found.'));

    // Real-time: notify all clients of deletion
    if (req.io) req.io.to('global').emit('school:deleted', { id: req.params.id });

    res.json(successResponse('School deleted.'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getSchools, getSchool, createSchool, updateSchool, deleteSchool };
