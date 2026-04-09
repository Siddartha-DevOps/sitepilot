import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️  Change to your PC's local IP when testing on phone
export const BASE_URL = 'http://192.168.1.100:5000/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) await AsyncStorage.multiRemove(['token','user']);
    return Promise.reject(err);
  }
);

export default api;