import api from './client';

const arr = (r) => {
  const d = r?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

const unwrap = (r) => r?.data?.data ?? r?.data ?? null;

export const listMyAddresses = () =>
  api.get('/addresses/me').then(arr);

export const createMyAddress = (payload) =>
  api.post('/addresses/me', payload).then(unwrap);

export const updateMyAddress = (id, payload) =>
  api.put(`/addresses/me/${id}`, payload).then(unwrap);

export const deleteMyAddress = (id) =>
  api.delete(`/addresses/me/${id}`).then(unwrap);
