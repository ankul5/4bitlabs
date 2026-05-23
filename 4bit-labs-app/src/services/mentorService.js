import api from './api';

export const getMentors = async (skill = '') => {
  const res = await api.get('/mentors', { params: skill ? { skill } : {} });
  return res.data?.data?.mentors || [];
};

export const getMentor = async (mentorId) => {
  const res = await api.get(`/mentors/${mentorId}`);
  return res.data?.data?.mentor || null;
};

export const getMyBookings = async () => {
  const res = await api.get('/mentors/bookings/my');
  return res.data?.data?.bookings || [];
};

/**
 * Full booking flow:
 * 1. createOrder → get Razorpay orderId
 * 2. Open Razorpay checkout (in component)
 * 3. verifyPayment → confirm booking in backend
 */
export const createOrder = async (mentorId, slot) => {
  const res = await api.post('/payments/create-order', { mentorId, slot });
  return res.data; // { order, bookingId, keyId }
};

export const verifyPayment = async (paymentData) => {
  const res = await api.post('/payments/verify', paymentData);
  return res.data?.data?.booking;
};
