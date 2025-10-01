import api from './client';

export const register = (payload) => api.post('/auth/register', payload).then(r => r.data.user);
export const login = (payload) => api.post('/auth/login', payload).then(r => r.data.user);
