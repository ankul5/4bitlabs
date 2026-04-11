import api from './api';

/**
 * Mark attendance when a student opens a lecture video.
 * Call this when the video player starts.
 */
export const markAttendance = async (courseId, lectureId, watchedDurationSeconds = 0) => {
  const res = await api.post('/attendance', { courseId, lectureId, watchedDurationSeconds });
  return res.data;
};

export const getMyAttendance = async (courseId = null) => {
  const params = courseId ? { courseId } : {};
  const res = await api.get('/attendance/my', { params });
  return res.data;
};
