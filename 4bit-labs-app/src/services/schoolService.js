import api from './api';

/**
 * Get all schools — used in registration screen dropdown.
 * This endpoint is public (no JWT required).
 */
export const getSchools = async () => {
  const res = await api.get('/schools');
  return res.data?.data?.schools || [];
};

/**
 * Get a single school with its courses.
 */
export const getSchool = async (schoolId) => {
  const res = await api.get(`/schools/${schoolId}`);
  return res.data?.data?.school || null;
};
