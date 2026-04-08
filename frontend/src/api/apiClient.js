import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Replace with your server IP / hosted URL ──────────────────────────────────
export const BASE_URL = 'http://192.168.31.1:5000/api';  // local dev
// export const BASE_URL = 'https://your-server.com/api'; // production

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach token to every request ─────────────────────────────────────────────
apiClient.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Global error handler ──────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(err);
  }
);

export default apiClient;