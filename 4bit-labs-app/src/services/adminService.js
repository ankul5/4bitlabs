import api from './api';

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const getDashboardStats = async () => {
  const res = await api.get('/admin/dashboard-stats');
  return res.data?.data || {
    totalStudents: 0,
    totalCourses: 0,
    totalSchools: 0,
    totalQuizzes: 0,
    recentStudents: [],
  };
};

export const getStudents = async (schoolId) => {
  const res = await api.get('/users', { params: { schoolId, role: 'student' } });
  return res.data?.users || [];
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const markAttendance = async (data) => {
  const res = await api.post('/attendance', data);
  return res.data;
};

export const getAttendance = async (params) => {
  const res = await api.get('/attendance', { params });
  return res.data?.records || [];
};

export const markStudentAttendance = async (data) => {
  const res = await api.post('/attendance/mark-student', data);
  return res.data;
};

// ─── Enrolled Students per Course ─────────────────────────────────────────────
export const getEnrolledStudents = async (courseId) => {
  const res = await api.get(`/enrollments/course/${courseId}`);
  return res.data?.enrollments || [];
};

// ─── Quizzes ──────────────────────────────────────────────────────────────────
export const getQuizzes = async (schoolId) => {
  const res = await api.get('/quizzes', { params: { schoolId } });
  return res.data?.quizzes || [];
};

export const createQuiz = async (data) => {
  const res = await api.post('/quizzes', data);
  return res.data?.quiz;
};

export const updateQuiz = async (id, data) => {
  const res = await api.put(`/quizzes/${id}`, data);
  return res.data?.quiz;
};

export const deleteQuiz = async (id) => {
  const res = await api.delete(`/quizzes/${id}`);
  return res.data;
};

export const addQuestion = async (quizId, data) => {
  const res = await api.post(`/quizzes/${quizId}/questions`, data);
  return res.data?.question;
};

// ─── Courses ──────────────────────────────────────────────────────────────────
export const getCourses = async () => {
  const res = await api.get('/courses/public');
  return res.data?.courses || [];
};

export const createCourse = async (data) => {
  const res = await api.post('/courses', data);
  return res.data?.course;
};

// ─── Lectures ─────────────────────────────────────────────────────────────────
export const getLectures = async (courseId) => {
  const res = await api.get(`/courses/${courseId}/lectures`);
  return res.data?.lectures || [];
};

export const createLecture = async (courseId, data) => {
  const res = await api.post(`/courses/${courseId}/lectures`, data);
  return res.data?.lecture;
};

export const uploadVideo = async (videoUri) => {
  const formData = new FormData();
  const filename = videoUri.split('/').pop() || 'video.mp4';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `video/${match[1]}` : `video/mp4`;
  
  formData.append('file', {
    uri: videoUri,
    name: filename,
    type,
  });

  const res = await api.post('/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// ─── Lab Items ────────────────────────────────────────────────────────────────
export const getLabItems = async (schoolId) => {
  const res = await api.get('/labs', { params: { schoolId } });
  return res.data?.items || [];
};

export const createLabItem = async (data) => {
  const res = await api.post('/labs', data);
  return res.data?.item;
};

export const updateLabItem = async (id, data) => {
  const res = await api.put(`/labs/${id}`, data);
  return res.data?.item;
};

export const deleteLabItem = async (id) => {
  const res = await api.delete(`/labs/${id}`);
  return res.data;
};

// ─── Announcements ────────────────────────────────────────────────────────────
export const getAnnouncements = async (schoolId) => {
  const res = await api.get('/announcements', { params: { schoolId } });
  return res.data?.announcements || [];
};

export const createAnnouncement = async (data) => {
  const res = await api.post('/announcements', data);
  return res.data?.announcement;
};

export const deleteAnnouncement = async (id) => {
  const res = await api.delete(`/announcements/${id}`);
  return res.data;
};

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export const getLeaderboard = async (courseId) => {
  const res = await api.get('/leaderboard', { params: { courseId } });
  return res.data?.entries || [];
};

// ─── Profile ──────────────────────────────────────────────────────────────────
export const updateProfile = async (data) => {
  const res = await api.put('/auth/me', data);
  return res.data?.user;
};

// ─── Schools ──────────────────────────────────────────────────────────────────
export const getSchools = async () => {
  const res = await api.get('/schools');
  return res.data?.schools || [];
};

export const createSchool = async (data) => {
  const res = await api.post('/schools', data);
  return res.data?.school;
};

export const getSchoolStats = async () => {
  const res = await api.get('/admin/school-stats');
  return res.data?.data || null;
};

// ─── Overrides ────────────────────────────────────────────────────────────────
export const manuallyUpdatePoints = async (id, data) => {
  const res = await api.put(`/admin/users/${id}/points`, data);
  return res.data;
};

export const overrideAttendanceStatus = async (id, data) => {
  const res = await api.put(`/admin/attendance/${id}/override`, data);
  return res.data;
};
