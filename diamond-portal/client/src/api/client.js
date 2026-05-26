import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Request interceptor — add Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — auto-refresh on 401
let refreshing = null;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && localStorage.getItem('refreshToken')) {
      original._retry = true;
      if (!refreshing) {
        refreshing = axios.post('/api/auth/refresh', { refreshToken: localStorage.getItem('refreshToken') })
          .then(r => {
            localStorage.setItem('accessToken', r.data.accessToken);
            refreshing = null;
          })
          .catch(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            refreshing = null;
          });
      }
      await refreshing;
      original.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
      return api(original);
    }
    return Promise.reject(error);
  }
);

export default api;
