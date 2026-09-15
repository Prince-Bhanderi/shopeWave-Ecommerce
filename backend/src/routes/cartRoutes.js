import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getCart).post(addToCart).delete(clearCart);
router.post('/apply-coupon', applyCoupon);
router.delete('/coupon', removeCoupon);
router.route('/:itemId').put(updateCartItem).delete(removeCartItem);

export default router;
