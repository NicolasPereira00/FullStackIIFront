import api from './client';

const unwrap = (r) => r?.data?.data ?? r?.data ?? null;

export const getMyCart = () => api.get('/cart').then(unwrap);

export const ensureCart = async () => {
  try {
    return await getMyCart();
  } catch (e) {
    if (e?.response?.status === 404) {
      return api.post('/cart/start').then(unwrap);
    }
    throw e;
  }
};

export const addCartItem = (payload) =>
  api.post('/cart/items', payload).then(unwrap);

export const updateCartItem = (itemId, payload) =>
  api.put(`/cart/items/${itemId}`, payload).then(unwrap);

export const removeCartItem = (itemId) =>
  api.delete(`/cart/items/${itemId}`).then(unwrap);

export const checkoutCart = (addressId) =>
  api.post('/cart/checkout', { addressId }).then(unwrap);

export { addCartItem as addItemToCart };
