import apiClient from '../api/apiClient';

const reportService = {
  async getAll() {
    const { data } = await apiClient.get('/reports');
    return data;
  },

  async create(payload) {
    const { data } = await apiClient.post('/reports', payload);
    return data;
  },

  async getById(id) {
    const { data } = await apiClient.get(`/reports/${id}`);
    return data;
  },

  async getTodaysReports() {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await apiClient.get(`/reports?date=${today}`);
    return data;
  },
};

export default reportService;