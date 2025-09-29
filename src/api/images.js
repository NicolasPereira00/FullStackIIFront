import api from './client';

export const listProductImages = (productId) =>
  api.get(`/products/${productId}/images`).then(r => r.data);

export const uploadProductImage = (productId, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return api.post(`/products/${productId}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(r => r.data);
};

export const removeProductImage = (productId, imageId) =>
  api.delete(`/products/${productId}/images/${imageId}`).then(r => r.data);

export const listVariantImages = (variantId) =>
  api.get(`/variants/${variantId}/images`).then(r => r.data);

export const uploadVariantImage = (variantId, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return api.post(`/variants/${variantId}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(r => r.data);
};

export const removeVariantImage = (variantId, imageId) =>
  api.delete(`/variants/${variantId}/images/${imageId}`).then(r => r.data);
