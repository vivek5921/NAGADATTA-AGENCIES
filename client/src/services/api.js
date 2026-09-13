import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token and handle multipart FormData
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nagadatta_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // When sending FormData, delete Content-Type so browser sets boundary automatically
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
