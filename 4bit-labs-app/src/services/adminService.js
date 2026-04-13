import api from './api';

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const getDashboardStats = async (schoolId) => {
  const [usersRes, attRes, courseRes, quizRes, schoolRes] = await Promise.all([
    api.get('/users', { params: { schoolId } }).catch(() => ({ data: { data: { users: [] } } })),
    api.get('/attendance', { params: { schoolId } }).catch(() => ({ data: { data: { records: [] } } })),
    api.get('/courses', { params: { schoolId } }).catch(() => ({ data: { data: { courses: [] } } })),
    api.get('/quizzes', { params: { schoolId } }).catch(() => ({ data: { data: { quizzes: [] } } })),
    api.get('/schools').catch(() => ({ data: { data: { schools: [] } } }))
  ]);

  const students = usersRes.data?.data?.users || [];

  return {
    totalStudents: students.length,
    students,
    attendance: attRes.data?.data?.records || [],
    courses: courseRes.data?.data?.courses || [],
    quizzes: quizRes.data?.data?.quizzes || [],
    schools: schoolRes.data?.data?.schools || [],
  };
};

// ─── Students ─────────────────────────────────────────────────────────────────
export const getStudents = async (schoolId) => {
  const res = await api.get('/users', { params: { schoolId, role: 'student' } });
  return res.data?.data?.users || [];
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const markAttendance = async (data) => {
  const res = await api.post('/attendance', data);
  return res.data;
};

export const getAttendance = async (params) => {
  const res = await api.get('/attendance', { params });
  return res.data?.data?.records || [];
};

// ─── Quizzes ──────────────────────────────────────────────────────────────────
export const getQuizzes = async (schoolId) => {
  const res = await api.get('/quizzes', { params: { schoolId } });
  return res.data?.data?.quizzes || [];
};

export const createQuiz = async (data) => {
  const res = await api.post('/quizzes', data);
  return res.data?.data?.quiz;
};

export const updateQuiz = async (id, data) => {
  const res = await api.put(`/quizzes/${id}`, data);
  return res.data?.data?.quiz;
};

export const deleteQuiz = async (id) => {
  const res = await api.delete(`/quizzes/${id}`);
  return res.data;
};

export const addQuestion = async (quizId, data) => {
  const res = await api.post(`/quizzes/${quizId}/questions`, data);
  return res.data?.data?.question;
};

// ─── Courses ──────────────────────────────────────────────────────────────────
export const getCourses = async (schoolId) => {
  const res = await api.get('/courses', { params: { schoolId } });
  return res.data?.data?.courses || [];
};

export const createCourse = async (data) => {
  const res = await api.post('/courses', data);
  return res.data?.data?.course;
};

// ─── Lectures ─────────────────────────────────────────────────────────────────
export const getLectures = async (courseId) => {
  const res = await api.get(`/courses/${courseId}/lectures`);
  return res.data?.data?.lectures || [];
};

export const createLecture = async (courseId, data) => {
  const res = await api.post(`/courses/${courseId}/lectures`, data);
  return res.data?.data?.lecture;
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
  return res.data?.data?.items || [];
};

export const createLabItem = async (data) => {
  const res = await api.post('/labs', data);
  return res.data?.data?.item;
};

export const updateLabItem = async (id, data) => {
  const res = await api.put(`/labs/${id}`, data);
  return res.data?.data?.item;
};

export const deleteLabItem = async (id) => {
  const res = await api.delete(`/labs/${id}`);
  return res.data;
};

// ─── Announcements ────────────────────────────────────────────────────────────
export const getAnnouncements = async (schoolId) => {
  const res = await api.get('/announcements', { params: { schoolId } });
  return res.data?.data?.announcements || [];
};

export const createAnnouncement = async (data) => {
  const res = await api.post('/announcements', data);
  return res.data?.data?.announcement;
};

export const deleteAnnouncement = async (id) => {
  const res = await api.delete(`/announcements/${id}`);
  return res.data;
};

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export const getLeaderboard = async (courseId) => {
  const res = await api.get('/leaderboard', { params: { courseId } });
  return res.data?.data?.entries || [];
};

// ─── Profile ──────────────────────────────────────────────────────────────────
export const updateProfile = async (data) => {
  const res = await api.put('/users/me', data);
  return res.data?.data?.user;
};

// ─── Schools ──────────────────────────────────────────────────────────────────
export const getSchools = async () => {
  const res = await api.get('/schools');
  return res.data?.data?.schools || [];
};

export const createSchool = async (data) => {
  const res = await api.post('/schools', data);
  return res.data?.data?.school;
};

// ─── Overrides ────────────────────────────────────────────────────────────────
export const manuallyUpdatePoints = async (id, data) => {
  const res = await api.put(`/admin/users/${id}/points`, data);
  return res.data?.data;
};

export const overrideAttendanceStatus = async (id, data) => {
  const res = await api.put(`/admin/attendance/${id}/override`, data);
  return res.data?.data;
};
