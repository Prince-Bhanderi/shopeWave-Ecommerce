import axiosClient from './axiosClient';

const orderService = {
  createOrder: (payload) => axiosClient.post('/orders', payload),
  getMyOrders: (params) => axiosClient.get('/orders/my-orders', { params }),
  getOrderById: (id) => axiosClient.get(`/orders/${id}`),
  cancelOrder: (id, reason) => axiosClient.put(`/orders/${id}/cancel`, { reason }),
};

export default orderService;
