import api from './api';

export const getLeaderboard = async (courseId, page = 1, limit = 20) => {
  const res = await api.get(`/leaderboard/${courseId}`, { params: { page, limit } });
  return res.data;
};

export const getMyRanks = async () => {
  const res = await api.get('/leaderboard/my-ranks');
  return res.data.ranks;
};
