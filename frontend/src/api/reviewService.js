import axiosClient from './axiosClient';

const reviewService = {
  getRecentReviews: (limit = 6) => axiosClient.get('/reviews/recent', { params: { limit } }),
  getProductReviews: (productId, params) => axiosClient.get(`/products/${productId}/reviews`, { params }),
  createReview: (productId, payload) => axiosClient.post(`/products/${productId}/reviews`, payload),
  updateReview: (reviewId, payload) => axiosClient.put(`/reviews/${reviewId}`, payload),
  deleteReview: (reviewId) => axiosClient.delete(`/reviews/${reviewId}`),
};

export default reviewService;
