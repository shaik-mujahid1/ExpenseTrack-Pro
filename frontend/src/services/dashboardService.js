import api from './api';

export const dashboardService = {
  getSummary: async () => {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },

  getAnalytics: async (timeframe = 'MONTHLY', startDate = null, endDate = null) => {
    const query = new URLSearchParams({ timeframe });
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);
    const res = await api.get(`/analytics?${query.toString()}`);
    return res.data;
  },
};
