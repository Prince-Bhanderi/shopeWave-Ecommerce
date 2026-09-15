import axiosClient from './axiosClient';

const authService = {
  register: (payload) => axiosClient.post('/auth/register', payload),
  login: (payload) => axiosClient.post('/auth/login', payload),
  logout: () => axiosClient.post('/auth/logout'),
  getMe: () => axiosClient.get('/auth/me'),
  updateProfile: (payload) => axiosClient.put('/auth/profile', payload),
  changePassword: (payload) => axiosClient.put('/auth/change-password', payload),
  forgotPassword: (email) => axiosClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => axiosClient.post(`/auth/reset-password/${token}`, { password }),
};

export default authService;
