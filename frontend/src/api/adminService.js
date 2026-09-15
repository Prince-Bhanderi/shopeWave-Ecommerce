import axiosClient from './axiosClient';

const adminService = {
  getDashboardStats: (params) => axiosClient.get('/admin/dashboard', { params }),

  getAllOrders: (params) => axiosClient.get('/admin/orders', { params }),
  getOrderById: (id) => axiosClient.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => axiosClient.put(`/admin/orders/${id}/status`, { status }),
  updatePaymentStatus: (id, paymentStatus) => axiosClient.put(`/admin/orders/${id}/payment-status`, { paymentStatus }),
  cancelOrder: (id, reason) => axiosClient.put(`/admin/orders/${id}/cancel`, { reason }),

  getAllUsers: (params) => axiosClient.get('/admin/users', { params }),
  getUserById: (id) => axiosClient.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => axiosClient.put(`/admin/users/${id}/role`, { role }),
  toggleBlockUser: (id, isBlocked) => axiosClient.put(`/admin/users/${id}/block`, { isBlocked }),
  deleteUser: (id) => axiosClient.delete(`/admin/users/${id}`),

  getAdminProducts: (params) => axiosClient.get('/admin/products', { params }),
};

export default adminService;
