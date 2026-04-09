import api from '../api/apiClient';
export default {
  async getAll()           { const {data} = await api.get('/materials');              return data; },
  async create(payload)    { const {data} = await api.post('/materials',payload);     return data; },
  async update(id,payload) { const {data} = await api.put(`/materials/${id}`,payload);return data; },
  async getLowStock()      { const {data} = await api.get('/materials/low-stock');    return data; },
  async consume(id,amount) { const {data} = await api.patch(`/materials/${id}/consume`,{amount}); return data; },
};