import api from './client';

const unwrap = (r) => r?.data?.data ?? r?.data ?? null;

export const getCachedCartId = () => null;
export const setCachedCartId = () => {};
export const clearCachedCartId = () => {};

export const startCart = async (customerId) => {
  try {
    const cart = await api.get('/cart').then(unwrap);
    return { id: cart.id };
  } catch (e) {
    if (e?.response?.status === 404) {
      const cart = await api.post('/cart/start', { customerId }).then(unwrap);
      return { id: cart.id };
    }
    throw e;
  }
};

export const listItems = async () => {
  const cart = await api.get('/cart').then(unwrap);
  return cart?.items ?? [];
};

export const getItem = (itemId) =>
  api.get(`/cart/items/${itemId}`).then(unwrap);

export const addItem = (_cartId, payload) =>
  api.post('/cart/items', payload).then(unwrap);

export const updateItem = (itemId, payload) =>
  api.put(`/cart/items/${itemId}`, payload).then(unwrap);

export const removeItem = (itemId) =>
  api.delete(`/cart/items/${itemId}`).then(unwrap);

export const checkout = (_cartId, shippingAddressId) =>
  api.post('/cart/checkout', { addressId: shippingAddressId }).then(unwrap);
