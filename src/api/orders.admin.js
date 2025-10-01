import api from './client';

export const adminListOrders = (params) =>
  api.get('/orders', { params }).then(r => r.data);

export const adminGetOrder = (id) =>
  api.get(`/orders/${id}`).then(r => r.data);

export const adminUpdateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status }).then(r => r.data);
