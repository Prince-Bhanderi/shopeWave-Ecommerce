import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} from '../controllers/productController.js';
import { productReviewRoutes } from './reviewRoutes.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createProductValidator, updateProductValidator } from '../validators/productValidators.js';

const router = express.Router();

router.use('/:productId/reviews', productReviewRoutes);

router.route('/').get(getProducts).post(protect, authorize('admin'), createProductValidator, validate, createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorize('admin'), updateProductValidator, validate, updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.patch('/:id/stock', protect, authorize('admin'), updateStock);

export default router;
