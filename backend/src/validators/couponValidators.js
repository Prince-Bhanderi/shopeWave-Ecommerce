import { body } from 'express-validator';

export const couponValidator = [
  body('code').trim().notEmpty().withMessage('Coupon code is required').isLength({ min: 3, max: 20 }),
  body('discountType').isIn(['percentage', 'fixed']).withMessage('Discount type must be percentage or fixed'),
  body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),
  body('minimumPurchase').optional().isFloat({ min: 0 }),
  body('expirationDate').notEmpty().withMessage('Expiration date is required').isISO8601().withMessage('Expiration date must be a valid date'),
  body('usageLimit').optional({ nullable: true }).isInt({ min: 1 }),
];
