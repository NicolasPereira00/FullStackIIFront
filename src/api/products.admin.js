import api from './client';

export const adminListProducts = (params) =>
  api.get('/products', { params }).then(r => r.data);

export const adminGetProduct = (id) =>
  api.get(`/products/${id}`).then(r => r.data);

export const adminCreateProduct = (payload) =>
  api.post('/products', payload).then(r => r.data);

export const adminUpdateProduct = (id, payload) =>
  api.put(`/products/${id}`, payload).then(r => r.data);

export const adminDeleteProduct = (id) =>
  api.delete(`/products/${id}`).then(r => r.data);

export const adminAddVariant = (productId, payload) =>
  api.post(`/products/${productId}/variants`, payload).then(r => r.data);

export const adminGetVariant = (productId, variantId) =>
  api.get(`/products/${productId}/variants/${variantId}`).then(r => r.data);

export const adminUpdateVariant = (productId, variantId, payload) =>
  api.put(`/products/${productId}/variants/${variantId}`, payload).then(r => r.data);

export const adminRemoveVariant = (productId, variantId) =>
  api.delete(`/products/${productId}/variants/${variantId}`).then(r => r.data);
