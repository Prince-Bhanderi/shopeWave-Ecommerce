import axiosClient from './axiosClient';

const couponService = {
  getCoupons: () => axiosClient.get('/coupons'),
  createCoupon: (payload) => axiosClient.post('/coupons', payload),
  updateCoupon: (id, payload) => axiosClient.put(`/coupons/${id}`, payload),
  deleteCoupon: (id) => axiosClient.delete(`/coupons/${id}`),
  checkCoupon: (code) => axiosClient.get(`/coupons/check/${code}`),
};

export default couponService;
