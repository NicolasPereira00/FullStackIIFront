import api from "./client";

const unwrap = (r) => (r?.data?.data ?? r?.data);

export const getUser = (id) =>
  api.get(`/users/${id}`).then(unwrap);

export const updateUser = (id, payload) =>
  api.put(`/users/${id}`, payload).then(unwrap);
