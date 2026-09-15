import express from 'express';
import {
  getDashboardStats,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  adminCancelOrder,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleBlockUser,
  deleteUser,
  getAdminProducts,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Every route below requires a logged-in admin
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);

router.get('/orders', getAllOrders);
router.get('/orders/:id', getAdminOrderById);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/payment-status', updatePaymentStatus);
router.put('/orders/:id/cancel', adminCancelOrder);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);

router.get('/products', getAdminProducts);

export default router;
