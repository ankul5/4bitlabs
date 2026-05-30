import api from './api';

export const getSchools = async () => {
  const response = await api.get('/schools');
  return response.data;
};

export const createSchool = async (name) => {
  const response = await api.post('/schools', { name });
  return response.data;
};

export const deleteSchool = async (id) => {
  const response = await api.delete(`/schools/${id}`);
  return response.data;
};

export const getStudents = async () => {
  const response = await api.get('/students');
  return response.data;
};

export const createStudent = async (data) => {
  const response = await api.post('/students', data);
  return response.data;
};

export const updateStudent = async (id, data) => {
  const response = await api.put(`/students/${id}`, data);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

export const verifyStudent = async (id) => {
  const response = await api.patch(`/students/${id}/verify`);
  return response.data;
};

export const getContent = async (schoolId, type) => {
  let url = '/content?';
  if (schoolId) url += `schoolId=${schoolId}&`;
  if (type) url += `type=${type}`;
  const response = await api.get(url);
  return response.data;
};

export const createContent = async (data) => {
  const response = await api.post('/content', data);
  return response.data;
};

export const updateContent = async (id, data) => {
  const response = await api.put(`/content/${id}`, data);
  return response.data;
};

export const deleteContent = async (id) => {
  const response = await api.delete(`/content/${id}`);
  return response.data;
};

export const getAnnouncements = async (schoolId) => {
  let url = '/announcements';
  if (schoolId) url += `?schoolId=${schoolId}`;
  const response = await api.get(url);
  return response.data;
};

export const createAnnouncement = async (data) => {
  const response = await api.post('/announcements', data);
  return response.data;
};

export const updateAnnouncement = async (id, data) => {
  const response = await api.put(`/announcements/${id}`, data);
  return response.data;
};

export const deleteAnnouncement = async (id) => {
  const response = await api.delete(`/announcements/${id}`);
  return response.data;
};
