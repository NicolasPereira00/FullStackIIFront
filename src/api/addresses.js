import api from './client';

export const listAddresses = (customerId) =>
  api.get('/addresses', { params: { customerId } }).then(r => r.data);

export const getAddress = (id) =>
  api.get(`/addresses/${id}`).then(r => r.data);

export const createAddress = (payload) =>
  api.post('/addresses', payload).then(r => r.data);

export const updateAddress = (id, payload) =>
  api.put(`/addresses/${id}`, payload).then(r => r.data);

export const removeAddress = (id) =>
  api.delete(`/addresses/${id}`).then(r => r.data);

export const setDefaultAddress = (id) =>
  api.post(`/addresses/${id}/default`).then(r => r.data);
