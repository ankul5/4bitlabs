import api from './api';

export const getQuizzes = async (courseId) => {
  const res = await api.get('/quizzes', { params: { courseId } });
  return res.data.quizzes;
};

export const getQuiz = async (quizId) => {
  const res = await api.get(`/quizzes/${quizId}`);
  return res.data.quiz;
};

/**
 * Submit quiz answers to the backend for auto-grading.
 * @param {string} quizId
 * @param {Array} answers - [{ questionId, selectedAnswer }]
 * @param {number} timeTakenSeconds
 */
export const submitQuiz = async (quizId, answers, timeTakenSeconds) => {
  const res = await api.post(`/quizzes/${quizId}/submit`, { answers, timeTakenSeconds });
  return res.data.attempt;
};
