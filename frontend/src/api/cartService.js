import axiosClient from './axiosClient';

const cartService = {
  getCart: () => axiosClient.get('/cart'),
  addToCart: (productId, quantity = 1) => axiosClient.post('/cart', { productId, quantity }),
  updateCartItem: (itemId, quantity) => axiosClient.put(`/cart/${itemId}`, { quantity }),
  removeCartItem: (itemId) => axiosClient.delete(`/cart/${itemId}`),
  clearCart: () => axiosClient.delete('/cart'),
  applyCoupon: (code) => axiosClient.post('/cart/apply-coupon', { code }),
  removeCoupon: () => axiosClient.delete('/cart/coupon'),
};

export default cartService;
