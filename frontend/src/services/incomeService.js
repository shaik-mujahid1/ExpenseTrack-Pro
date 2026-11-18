import api from './api';

export const incomeService = {
  getAll: async () => {
    const res = await api.get('/income');
    return res.data;
  },

  filter: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.keyword) query.append('keyword', params.keyword);

    const res = await api.get(`/income/filter?${query.toString()}`);
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/income/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/income', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/income/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/income/${id}`);
    return res.data;
  },
};
