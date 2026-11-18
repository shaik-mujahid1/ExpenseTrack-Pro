import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  register: async (fullName, email, password, currency = 'INR') => {
    const response = await api.post('/auth/register', { fullName, email, password, currency });
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (fullName, currency) => {
    const response = await api.put('/user/profile', { fullName, currency });
    const stored = authService.getCurrentUser();
    if (stored) {
      stored.fullName = response.data.fullName;
      stored.currency = response.data.currency;
      localStorage.setItem('user', JSON.stringify(stored));
    }
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/user/change-password', { currentPassword, newPassword });
    return response.data;
  },
};
