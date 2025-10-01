import api from "./client";

const unwrapList = (r) => (Array.isArray(r.data) ? r.data : r.data?.data ?? []);
const unwrapObj  = (r) => (r.data?.data ?? r.data);

// -------- Produtos (mantém) --------
export const adminListProducts = (params) =>
  api.get("/products", { params }).then(unwrapList);

export const adminGetProduct = (id) =>
  api.get(`/products/${id}`).then(unwrapObj);

export const adminCreateProduct = (payload) =>
  api.post("/products", payload).then(unwrapObj);

export const adminUpdateProduct = (id, payload) =>
  api.put(`/products/${id}`, payload).then(unwrapObj);

export const adminDeleteProduct = (id) =>
  api.delete(`/products/${id}`).then(unwrapObj);


export const adminAddVariant = (productId, payload) =>
  api.post(`/products/${productId}/variants`, payload).then(unwrapList);

export const adminUpdateVariant = (variantId, payload) =>
  api.put(`/products/variants/${variantId}`, payload).then(unwrapList);

export const adminRemoveVariant = (variantId) =>
  api.delete(`/products/variants/${variantId}`).then(unwrapList);
