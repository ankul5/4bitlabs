import api from './api';

export const getAnnouncements = async (params = {}) => {
  const res = await api.get('/announcements', { params });
  return res.data?.data?.announcements || [];
};

export const getAnnouncement = async (id) => {
  const res = await api.get(`/announcements/${id}`);
  return res.data?.data?.announcement || null;
};

/**
 * Create a new announcement (teacher/admin only)
 * @param {object} data - { title, body, type, schoolId?, courseId? }
 */
export const createAnnouncement = async (data) => {
  const res = await api.post('/announcements', data);
  return res.data?.data?.announcement;
};

export const updateAnnouncement = async (id, data) => {
  const res = await api.put(`/announcements/${id}`, data);
  return res.data?.data?.announcement;
};

export const deleteAnnouncement = async (id) => {
  const res = await api.delete(`/announcements/${id}`);
  return res.data;
};
