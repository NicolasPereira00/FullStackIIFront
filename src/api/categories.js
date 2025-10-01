import api from './client';

const pickList = (r) => {
  const d = r?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  return [];
};

const pickObj = (r) => (r?.data?.data ?? r?.data ?? r);

export const listCategories = (params) =>
  api.get('/categories', { params }).then(pickList);

export const createCategory = (payload) =>
  api.post('/categories', payload).then(pickObj);

export const updateCategory = (id, payload) =>
  api.put(`/categories/${id}`, payload).then(pickObj);

export const deleteCategory = (id) =>
  api.delete(`/categories/${id}`).then(pickObj);
