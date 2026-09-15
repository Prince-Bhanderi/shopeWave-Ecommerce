import express from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getRecentReviews,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { reviewValidator, updateReviewValidator } from '../validators/reviewValidators.js';

// mergeParams so this router can read :productId when mounted under /api/products/:productId/reviews
const nestedRouter = express.Router({ mergeParams: true });

nestedRouter.route('/').get(getProductReviews).post(protect, reviewValidator, validate, createReview);

// Standalone router for /api/reviews/:id and /api/reviews/recent
const standaloneRouter = express.Router();

standaloneRouter.get('/recent', getRecentReviews);

standaloneRouter
  .route('/:id')
  .put(protect, updateReviewValidator, validate, updateReview)
  .delete(protect, deleteReview);

export { nestedRouter as productReviewRoutes, standaloneRouter as reviewRoutes };
