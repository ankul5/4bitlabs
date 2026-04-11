/**
 * Role-based access control middleware.
 * Usage: router.get('/admin-only', protect, authorize('super_admin'), handler)
 * Usage: router.get('/multi', protect, authorize('teacher', 'school_admin'), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized for this action. Required: ${roles.join(', ')}.`,
      });
    }
    next();
  };
};

/**
 * Ensure the requesting student belongs to the same school as the requested resource.
 * Attach schoolId from req.user to the query for scoping.
 */
const sameSchool = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
  // Admins and super_admins can access any school
  if (['school_admin', 'super_admin', 'teacher'].includes(req.user.role)) return next();
  // Students can only access their own school data
  req.schoolFilter = { $or: [{ schoolId: req.user.schoolId }, { schoolId: { $exists: false } }] };
  next();
};

module.exports = { authorize, sameSchool };
