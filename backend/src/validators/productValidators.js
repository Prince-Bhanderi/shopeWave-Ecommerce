import { body, param } from 'express-validator';

export const createProductValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 120 }),
  body('description').trim().notEmpty().withMessage('Product description is required'),
  body('price').notEmpty().withMessage('Price is required').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('discountPrice')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Discount price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required').isMongoId().withMessage('Category must be a valid id'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('stock').notEmpty().withMessage('Stock is required').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
];

export const updateProductValidator = [
  param('id').isMongoId().withMessage('Invalid product id'),
  body('name').optional().trim().isLength({ min: 1, max: 120 }),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('discountPrice').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body('category').optional().isMongoId().withMessage('Category must be a valid id'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

export const mongoIdParamValidator = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
];
