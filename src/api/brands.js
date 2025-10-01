import api from './client';

const pickList = (r) => {
  const d = r?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  return [];
};

const pickObj = (r) => (r?.data?.data ?? r?.data ?? r);

export const listBrands = (params) =>
  api.get('/brands', { params }).then(pickList);

export const createBrand = (payload) =>
  api.post('/brands', payload).then(pickObj);

export const updateBrand = (id, payload) =>
  api.put(`/brands/${id}`, payload).then(pickObj);

export const deleteBrand = (id) =>
  api.delete(`/brands/${id}`).then(pickObj);
