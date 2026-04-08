import apiClient from '../api/apiClient';

const projectService = {
  async getAll() {
    const { data } = await apiClient.get('/projects');
    return data;
  },

  async getById(id) {
    const { data } = await apiClient.get(`/projects/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await apiClient.post('/projects', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await apiClient.put(`/projects/${id}`, payload);
    return data;
  },

  async delete(id) {
    await apiClient.delete(`/projects/${id}`);
  },

  async getReports(projectId) {
    const { data } = await apiClient.get(`/projects/${projectId}/reports`);
    return data;
  },

  async getPhotos(projectId) {
    const { data } = await apiClient.get(`/projects/${projectId}/photos`);
    return data;
  },
};

export default projectService;