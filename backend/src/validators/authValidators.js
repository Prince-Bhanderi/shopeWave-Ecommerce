import { body } from 'express-validator';

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 60 }),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('phone').optional({ checkFalsy: true }).isLength({ min: 7, max: 20 }).withMessage('Please provide a valid phone number'),
];

export const loginValidator = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const updateProfileValidator = [
  body('name').optional().trim().isLength({ min: 1, max: 60 }).withMessage('Name must be between 1 and 60 characters'),
  body('phone').optional({ checkFalsy: true }).isLength({ min: 7, max: 20 }).withMessage('Please provide a valid phone number'),
  body('email').optional().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long'),
];

export const forgotPasswordValidator = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
];

export const resetPasswordValidator = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];
