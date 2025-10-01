import api from './client';

export const getUser = (id) =>
  api.get(`/users/${id}`).then(r => r.data);

export const updateUser = (id, payload) =>
  api.put(`/users/${id}`, payload).then(r => r.data);
