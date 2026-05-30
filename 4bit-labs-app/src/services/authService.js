import api from './api';

export const loginUser = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const registerUser = async ({ full_name, password, school_id, phone }) => {
  const response = await api.post('/auth/register', { full_name, password, school_id, phone });
  return response.data;
};
