import axios from 'axios';
import { getStoredToken, clearAuthStorage } from '../utils/storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalizes every rejected request into a plain string message so
// components/slices never need to know Axios's error shape.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    const errors = error.response?.data?.errors || [];

    if (status === 401 && !error.config?.url?.includes('/auth/login')) {
      clearAuthStorage();
    }

    return Promise.reject({ status, message, errors });
  }
);

export default axiosClient;
export { API_URL };
