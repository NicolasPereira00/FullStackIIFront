import api from './client';

export const listBrands = (params) =>
  api.get('/brands', { params }).then(r => r.data);

export const createBrand = (payload) =>
  api.post('/brands', payload).then(r => r.data);

export const updateBrand = (id, payload) =>
  api.put(`/brands/${id}`, payload).then(r => r.data);

export const deleteBrand = (id) =>
  api.delete(`/brands/${id}`).then(r => r.data);
