import api from './client';

const CART_KEY = 'cartId';

export const getCachedCartId = () => localStorage.getItem(CART_KEY);
export const setCachedCartId = (id) => localStorage.setItem(CART_KEY, String(id));
export const clearCachedCartId = () => localStorage.removeItem(CART_KEY);

export const startCart = async (customerId) => {
  const saved = getCachedCartId();
  if (saved) {
    try {
      await listItems(saved);
      return { id: Number(saved) };
    } catch (_) {
      clearCachedCartId();
    }
  }
  const c = await api.post('/carts/start', { customerId }).then(r => r.data);
  setCachedCartId(c.id);
  return c;
};

export const listItems = (cartId) =>
  api.get(`/carts/${cartId}/items`).then(r => r.data);

export const getItem = (itemId) =>
  api.get(`/carts/items/${itemId}`).then(r => r.data);

export const addItem = (cartId, payload) =>
  api.post(`/carts/${cartId}/items`, payload).then(r => r.data);

export const updateItem = (itemId, payload) =>
  api.put(`/carts/items/${itemId}`, payload).then(r => r.data);

export const removeItem = (itemId) =>
  api.delete(`/carts/items/${itemId}`).then(r => r.data);

export const checkout = (cartId, shippingAddressId) =>
  api.post(`/carts/${cartId}/checkout`, { shippingAddressId }).then(r => r.data);
