import apiClient from '../api/apiClient';

const materialService = {
  async getAll() {
    const { data } = await apiClient.get('/materials');
    return data;
  },

  async create(payload) {
    const { data } = await apiClient.post('/materials', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await apiClient.put(`/materials/${id}`, payload);
    return data;
  },

  async getLowStock(threshold = 10) {
    const { data } = await apiClient.get(`/materials/low-stock?threshold=${threshold}`);
    return data;
  },

  async uploadPhoto(formData) {
    const { data } = await apiClient.post('/photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

export default materialService;