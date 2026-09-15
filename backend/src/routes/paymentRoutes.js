import express from 'express';
import { createPaymentIntent, createCashfreeOrder } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Note: the Stripe and Cashfree webhook routes are mounted separately in
// app.js because they require the raw (non-JSON-parsed) request body for
// signature verification.
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/cashfree/create-order', protect, createCashfreeOrder);

export default router;