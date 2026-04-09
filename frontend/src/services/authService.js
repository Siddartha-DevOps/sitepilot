import api from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user',  JSON.stringify(data.user));
    return data;
  },
  async logout() { await AsyncStorage.multiRemove(['token','user']); },
  async getProfile() { const { data } = await api.get('/auth/profile'); return data; },
};