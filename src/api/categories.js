import api from './client';

export const listCategories = (params) =>
  api.get('/categories', { params }).then(r => r.data);

export const createCategory = (payload) =>
  api.post('/categories', payload).then(r => r.data);

export const updateCategory = (id, payload) =>
  api.put(`/categories/${id}`, payload).then(r => r.data);

export const deleteCategory = (id) =>
  api.delete(`/categories/${id}`).then(r => r.data);
