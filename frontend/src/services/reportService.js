import api from './api';

export const reportService = {
  downloadCsv: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.type && params.type !== 'ALL') query.append('type', params.type);

    const res = await api.get(`/reports/export/csv?${query.toString()}`, {
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `expense_report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
