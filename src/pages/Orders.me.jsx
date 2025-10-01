import api from './client';

const un = (r) => {
  const d = r?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};
const unwrap = (r) => r?.data?.data ?? r?.data ?? null;

export const listMyOrders = () =>
  api.get('/orders/me').then(un);

export const getMyOrder = (id) =>
  api.get(`/orders/me/${id}`).then(unwrap);
