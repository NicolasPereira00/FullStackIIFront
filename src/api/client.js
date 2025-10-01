import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('user');
  if (raw) {
    const user = JSON.parse(raw);
    if (user?.id) config.headers['X-User-Id'] = user.id;
  }
  return config;
});

export default api;
