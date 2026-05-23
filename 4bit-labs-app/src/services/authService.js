import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../config/firebase";
import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Login with email/password via Firebase, then verify with our backend to get JWT.
 */
export const loginWithEmail = async (email, password) => {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCred.user.getIdToken();
  const res = await api.post("/auth/verify-token", { idToken });
  const payload = res.data?.data || res.data;
  await AsyncStorage.setItem("jwt", payload.token);
  return payload.user;
};

/**
 * Register new user: create Firebase account, then store in our PostgreSQL DB.
 * If Firebase says email already exists, try to sign in instead and register with backend.
 */
export const registerUser = async ({
  name,
  email,
  password,
  phone,
  schoolId,
  customSchoolName,
  courseIds,
}) => {
  let userCred;
  try {
    userCred = await createUserWithEmailAndPassword(auth, email, password);
  } catch (fbError) {
    if (fbError.code === "auth/email-already-in-use") {
      // Firebase account exists but backend might not have the user
      // Try signing in with Firebase and registering with backend
      userCred = await signInWithEmailAndPassword(auth, email, password);
    } else {
      throw fbError;
    }
  }

  const idToken = await userCred.user.getIdToken();
  const res = await api.post("/auth/register", {
    idToken,
    name,
    email,
    phone,
    schoolId,
    customSchoolName,
    courseIds,
  });
  const payload = res.data?.data || res.data;
  await AsyncStorage.setItem("jwt", payload.token);
  return payload.user;
};

/**
 * Logout from Firebase and clear local JWT.
 */
export const logoutUser = async () => {
  await signOut(auth);
  await AsyncStorage.removeItem("jwt");
};

/**
 * Get current user profile from backend.
 */
export const getMyProfile = async () => {
  const res = await api.get("/auth/me");
  const payload = res.data?.data || res.data;
  return payload.user;
};

/**
 * Register device FCM token for push notifications.
 */
export const registerFcmToken = async (fcmToken) => {
  await api.put("/auth/fcm-token", { fcmToken });
};

/**
 * Upload an image file (e.g. avatar) to backend
 */
export const uploadImage = async (imageUri) => {
  const formData = new FormData();
  const filename = imageUri.split("/").pop() || "photo.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image`;

  formData.append("file", {
    uri: imageUri,
    name: filename,
    type,
  });

  const res = await api.post("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data || res.data;
};

/**
 * Update current user profile (name, phone, avatar)
 */
export const updateMyProfile = async (updates) => {
  const res = await api.put("/auth/me", updates);
  const payload = res.data?.data || res.data;
  return payload.user;
};
