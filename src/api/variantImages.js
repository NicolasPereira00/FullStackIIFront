import api from './client';

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
