import express from 'express';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, checkCoupon } from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { couponValidator } from '../validators/couponValidators.js';

const router = express.Router();

router.use(protect);

router.get('/check/:code', checkCoupon);

router.use(authorize('admin'));
router.route('/').get(getCoupons).post(couponValidator, validate, createCoupon);
router.route('/:id').put(updateCoupon).delete(deleteCoupon);

export default router;
