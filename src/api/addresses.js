import api from './client';

const un = (r) => {
  const d = r?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

const unwrap = (r) => r?.data?.data ?? r?.data ?? null;

export const listAddresses = (params) =>
  api.get('/addresses', { params }).then(un);

export const getAddress = (id) =>
  api.get(`/addresses/${id}`).then(unwrap);

export const createAddress = (payload) =>
  api.post('/addresses', payload).then(unwrap);

export const updateAddress = (id, payload) =>
  api.put(`/addresses/${id}`, payload).then(unwrap);

export const removeAddress = (id) =>
  api.delete(`/addresses/${id}`).then(unwrap);

// Remover esta export se não existir no back:
export const setDefaultAddress = undefined;
