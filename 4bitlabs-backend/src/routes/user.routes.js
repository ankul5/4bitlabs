const express = require('express');
const {
  getUsers, getUser, updateUserRole, deactivateUser, activateUser, getUserStats,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { updateUserRoleValidation, validate } = require('../middleware/validators');

const router = express.Router();

// All user management routes require admin access

// GET  /api/v1/users                     — List all users (paginated, filterable)
router.get('/', protect, authorize('school_admin', 'super_admin'), getUsers);

// GET  /api/v1/users/:id                 — Get user detail
router.get('/:id', protect, authorize('school_admin', 'super_admin'), getUser);

// GET  /api/v1/users/:id/stats           — Get user statistics
router.get('/:id/stats', protect, authorize('school_admin', 'super_admin'), getUserStats);

// PUT  /api/v1/users/:id/role            — Change user role
router.put(
  '/:id/role',
  protect,
  authorize('super_admin'),
  updateUserRoleValidation,
  validate,
  updateUserRole
);

// PUT  /api/v1/users/:id/deactivate      — Deactivate user
router.put('/:id/deactivate', protect, authorize('school_admin', 'super_admin'), deactivateUser);

// PUT  /api/v1/users/:id/activate        — Reactivate user
router.put('/:id/activate', protect, authorize('school_admin', 'super_admin'), activateUser);

module.exports = router;
