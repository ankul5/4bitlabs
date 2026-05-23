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
const LOCAL_IP = '172.28.116.17'; // ← Your machine's current WiFi IP

const getBaseUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:5000/api/v1';
  if (Platform.OS === 'android') {
    // __DEV__ check: emulator uses 10.0.2.2, physical device uses real IP
    return `http://${LOCAL_IP}:5000/api/v1`;
  }
  // iOS simulator can use localhost, physical iOS needs IP
  return `http://${LOCAL_IP}:5000/api/v1`;
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
