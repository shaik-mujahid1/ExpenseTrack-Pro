import api from './api';

export const expenseService = {
  getAll: async () => {
    const res = await api.get('/expenses');
    return res.data;
  },

  filter: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.paymentMethod && params.paymentMethod !== 'ALL') query.append('paymentMethod', params.paymentMethod);
    if (params.keyword) query.append('keyword', params.keyword);

    const res = await api.get(`/expenses/filter?${query.toString()}`);
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/expenses/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/expenses', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/expenses/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/expenses/${id}`);
    return res.data;
  },
};
