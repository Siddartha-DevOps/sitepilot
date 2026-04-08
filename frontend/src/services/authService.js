import apiClient from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authService = {
  async login(email, password) {
    const { data } = await apiClient.post('/auth/login', { email, password });
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user',  JSON.stringify(data.user));
    return data;
  },

  async logout() {
    await AsyncStorage.multiRemove(['token', 'user']);
  },

  async getProfile() {
    const { data } = await apiClient.get('/auth/profile');
    return data;
  },

  async updateProfile(payload) {
    const { data } = await apiClient.put('/auth/profile', payload);
    return data;
  },
};

export default authService;