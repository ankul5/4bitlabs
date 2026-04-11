/**
 * Standardized API response helpers.
 * All controllers use these to ensure a consistent response schema.
 */

const successResponse = (message, data = {}) => ({
  success: true,
  message,
  ...data,
});

const errorResponse = (message, errors = null) => ({
  success: false,
  message,
  ...(errors && { errors }),
});

const paginatedResponse = (message, data, page, limit, total) => ({
  success: true,
  message,
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  },
});

module.exports = { successResponse, errorResponse, paginatedResponse };
