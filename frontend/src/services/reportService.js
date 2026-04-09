import api from '../api/apiClient';
export default {
  async getAll()        { const {data} = await api.get('/reports');          return data; },
  async create(payload) { const {data} = await api.post('/reports',payload); return data; },
  async getById(id)     { const {data} = await api.get(`/reports/${id}`);    return data; },
  async getToday() {
    const today = new Date().toISOString().split('T')[0];
    const {data} = await api.get(`/reports?date=${today}`);
    return data;
  },
};