import { body } from 'express-validator';

export const createOrderValidator = [
  body('shippingAddress.fullName').trim().notEmpty().withMessage('Full name is required'),
  body('shippingAddress.email').trim().isEmail().withMessage('A valid email is required'),
  body('shippingAddress.phone').trim().notEmpty().withMessage('Phone number is required'),
  body('shippingAddress.addressLine1').trim().notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
  body('shippingAddress.postalCode').trim().notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Country is required'),
  body('paymentMethod').isIn(['COD', 'Stripe', 'Cashfree']).withMessage('Payment method must be COD, Stripe or Cashfree'),
  body('paymentIntentId')
    .if(body('paymentMethod').equals('Stripe'))
    .notEmpty()
    .withMessage('paymentIntentId is required for Stripe payments'),
  body('cashfreeOrderId')
    .if(body('paymentMethod').equals('Cashfree'))
    .notEmpty()
    .withMessage('cashfreeOrderId is required for Cashfree payments'),
];

export const cancelOrderValidator = [body('reason').optional().trim().isLength({ max: 300 })];