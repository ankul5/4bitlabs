import api from './api';

export const getCourses = async () => {
  const res = await api.get('/courses');
  return res.data?.data?.courses || [];
};

export const getPublicCourses = async () => {
  const res = await api.get('/courses/public');
  return res.data?.data?.courses || [];
};

export const getCourse = async (courseId) => {
  const res = await api.get(`/courses/${courseId}`);
  return res.data?.data?.course || null;
};

export const getHomeSummary = async () => {
  const res = await api.get('/courses/home-summary');
  return res.data?.data || {};
};
