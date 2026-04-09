import api from '../api/apiClient';
export default {
  async getAll()           { const {data} = await api.get('/projects');           return data; },
  async getById(id)        { const {data} = await api.get(`/projects/${id}`);     return data; },
  async create(payload)    { const {data} = await api.post('/projects', payload); return data; },
  async update(id,payload) { const {data} = await api.put(`/projects/${id}`,payload); return data; },
  async getReports(id)     { const {data} = await api.get(`/projects/${id}/reports`);   return data; },
  async getMaterials(id)   { const {data} = await api.get(`/projects/${id}/materials`); return data; },
  async getPhotos(id)      { const {data} = await api.get(`/projects/${id}/photos`);    return data; },
};