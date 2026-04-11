import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Login with email/password via Firebase, then verify with our backend to get JWT.
 */
export const loginWithEmail = async (email, password) => {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCred.user.getIdToken();
  const res = await api.post('/auth/verify-token', { idToken });
  await AsyncStorage.setItem('jwt', res.data.token);
  return res.data.user;
};

/**
 * Register new user: create Firebase account, then store in our MongoDB.
 */
export const registerUser = async ({ name, email, password, phone, schoolId, courseIds }) => {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const idToken = await userCred.user.getIdToken();
  const res = await api.post('/auth/register', {
    idToken,
    name,
    email,
    phone,
    schoolId,
    courseIds,
  });
  await AsyncStorage.setItem('jwt', res.data.token);
  return res.data.user;
};

/**
 * Logout from Firebase and clear local JWT.
 */
export const logoutUser = async () => {
  await signOut(auth);
  await AsyncStorage.removeItem('jwt');
};

/**
 * Get current user profile from backend.
 */
export const getMyProfile = async () => {
  const res = await api.get('/auth/me');
  return res.data.user;
};

/**
 * Register device FCM token for push notifications.
 */
export const registerFcmToken = async (fcmToken) => {
  await api.put('/auth/fcm-token', { fcmToken });
};
