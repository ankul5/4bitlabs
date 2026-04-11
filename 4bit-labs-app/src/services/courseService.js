import api from './api';

export const getCourses = async () => {
  const res = await api.get('/courses');
  return res.data.courses;
};

export const getCourse = async (courseId) => {
  const res = await api.get(`/courses/${courseId}`);
  return res.data.course;
};

export const getHomeSummary = async () => {
  const res = await api.get('/courses/home-summary');
  return res.data;
};
