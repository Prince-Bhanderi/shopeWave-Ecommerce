import axiosClient from './axiosClient';

const wishlistService = {
  getWishlist: () => axiosClient.get('/wishlist'),
  addToWishlist: (productId) => axiosClient.post(`/wishlist/${productId}`),
  removeFromWishlist: (productId) => axiosClient.delete(`/wishlist/${productId}`),
  moveToCart: (productId) => axiosClient.post(`/wishlist/${productId}/move-to-cart`),
};

export default wishlistService;
