import api from './api';

/**
 * Enroll the current student in a course.
 * @param {string} courseId
 */
export const enrollInCourse = async (courseId) => {
  const res = await api.post('/enrollments', { courseId });
  return res.data.enrollment;
};

/**
 * Unenroll from a course.
 * @param {string} courseId
 */
export const unenrollFromCourse = async (courseId) => {
  const res = await api.delete(`/enrollments/${courseId}`);
  return res.data;
};

/**
 * Get all of the current student's enrollments.
 */
export const getMyEnrollments = async () => {
  const res = await api.get('/enrollments/my');
  return res.data.enrollments;
};

/**
 * Update lecture progress for an enrollment.
 * Call this when a student finishes watching a lecture.
 */
export const updateProgress = async (courseId, lectureId) => {
  const res = await api.put(`/enrollments/${courseId}/progress`, { lectureId });
  return res.data.enrollment;
};
