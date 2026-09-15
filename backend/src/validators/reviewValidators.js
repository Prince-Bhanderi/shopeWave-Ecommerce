import { body } from 'express-validator';

export const reviewValidator = [
  body('rating').notEmpty().withMessage('Rating is required').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Review comment is required').isLength({ max: 1000 }),
  body('title').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
];

export const updateReviewValidator = [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ min: 1, max: 1000 }),
  body('title').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
];
