import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * IMPORTANT: Replace with your machine's local IP address when testing with
 * Expo Go on a physical device. Your phone and laptop must be on the SAME WiFi.
 * 
 * Find your IP:
 *  - Windows: run `ipconfig` in CMD → look for "IPv4 Address"
 *  - Mac/Linux: run `ifconfig` → look for inet under en0
 *
 * Example: 'http://192.168.1.42:5000/api/v1'
 */
const API_BASE_URL = 'http://10.64.145.17:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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
