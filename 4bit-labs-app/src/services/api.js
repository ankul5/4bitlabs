import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Smart API base URL detection:
 *  - Web (Expo web): localhost
 *  - Android emulator: 10.0.2.2 (special alias for host machine)
 *  - Physical device: your machine's local WiFi IP
 *
 * ⚠️ UPDATE THIS if your WiFi IP changes (run `ipconfig` to find it)
 */
const getBaseUrl = () => {
  // Always use the Render production URL for real devices and production builds
  if (!__DEV__) {
    return 'https://fourbitlabs-api.onrender.com/api/v1';
  }

  // In development mode, you can still use the local IP if you are testing locally,
  // or just use the production URL so you never have to worry about IP changes again.
  // Using production URL everywhere to completely eliminate the local IP problem:
  return 'https://fourbitlabs-api.onrender.com/api/v1';
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor: attach JWT to every request ─────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 globally ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and let AuthContext handle logout
      await AsyncStorage.removeItem('jwt');
    }
    return Promise.reject(error);
  }
);

export default api;
