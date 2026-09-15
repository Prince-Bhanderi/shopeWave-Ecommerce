import express from 'express';
import {
  getCategories,
  getCategoryById,
  getCategoryProducts,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createCategoryValidator, updateCategoryValidator } from '../validators/categoryValidators.js';

const router = express.Router();

router
  .route('/')
  .get(getCategories)
  .post(protect, authorize('admin'), createCategoryValidator, validate, createCategory);

router.get('/:id/products', getCategoryProducts);

router
  .route('/:id')
  .get(getCategoryById)
  .put(protect, authorize('admin'), updateCategoryValidator, validate, updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

export default router;
