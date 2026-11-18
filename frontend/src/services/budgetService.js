import api from './api';

export const budgetService = {
  getAll: async () => {
    const res = await api.get('/budgets');
    return res.data;
  },

  getByMonth: async (month, year) => {
    const query = new URLSearchParams();
    if (month) query.append('month', month);
    if (year) query.append('year', year);
    const res = await api.get(`/budgets/month?${query.toString()}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/budgets', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/budgets/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/budgets/${id}`);
    return res.data;
  },
};
