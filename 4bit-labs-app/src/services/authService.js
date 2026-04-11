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

/**
 * Upload an image file (e.g. avatar) to backend
 */
export const uploadImage = async (imageUri) => {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image`;
  
  formData.append('file', {
    uri: imageUri,
    name: filename,
    type,
  });

  const res = await api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data; // should contain { data: { url } } based on backend
};

/**
 * Update current user profile (name, phone, avatar)
 */
export const updateMyProfile = async (updates) => {
  const res = await api.put('/auth/me', updates);
  return res.data.user;
};
