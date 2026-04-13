const LabItem = require('../models/LabItem');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getLabItems = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.schoolId) filter.school_id = req.query.schoolId;
    if (req.query.status) filter.status = req.query.status;
    const items = await LabItem.find(filter);
    res.json(successResponse('Lab items fetched.', { items, count: items.length }));
  } catch (e) { next(e); }
};

const createLabItem = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const item = await LabItem.create({ ...req.body, created_by: userId });
    res.status(201).json(successResponse('Lab item created.', { item }));
  } catch (e) { next(e); }
};

const updateLabItem = async (req, res, next) => {
  try {
    const item = await LabItem.findByIdAndUpdate(req.params.id, req.body);
    if (!item) return res.status(404).json(errorResponse('Lab item not found.'));
    res.json(successResponse('Lab item updated.', { item }));
  } catch (e) { next(e); }
};

const deleteLabItem = async (req, res, next) => {
  try {
    const item = await LabItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json(errorResponse('Lab item not found.'));
    res.json(successResponse('Lab item deleted.'));
  } catch (e) { next(e); }
};

module.exports = { getLabItems, createLabItem, updateLabItem, deleteLabItem };
