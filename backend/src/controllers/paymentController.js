import Stripe from 'stripe';
import { Cashfree, CFEnvironment } from 'cashfree-pg';
import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { calculateOrderTotals } from '../utils/calculatePrices.js';

const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
const stripe = isStripeConfigured ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const isCashfreeConfigured = Boolean(process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET);
const cashfreeEnvironment = process.env.CASHFREE_ENV === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
// The 7th constructor argument (XEnableErrorAnalytics) is explicitly set to
// `false` to opt out of the SDK's built-in Sentry error reporting, which is
// otherwise ON by default and would silently send error data to a third
// party. Constructed once at module load (not per-request).
const cashfree = isCashfreeConfigured
  ? new Cashfree(
      cashfreeEnvironment,
      process.env.CASHFREE_CLIENT_ID,
      process.env.CASHFREE_CLIENT_SECRET,
      undefined,
      undefined,
      undefined,
      false
    )
  : null;

// Cashfree is an India-first gateway; a fresh/test Cashfree account is
// INR-only by default (other currencies require a support request to
// Cashfree). This store displays prices in USD (see utils/formatters.js),
// so - same as the reasoning would be for any India-first gateway here -
// the numeric total is charged as INR rather than converted at a live
// exchange rate.
const CASHFREE_CURRENCY = 'INR';

// Cashfree requires customer_phone to be exactly 10 digits (Indian mobile
// format, no country code/symbols). Real shipping-address phone numbers
// won't always be in that shape (this project's own seed data uses a
// placeholder US-style number), so this defensively falls back to
// Cashfree's own published sandbox test number rather than hard-failing
// order creation over a formatting mismatch.
const sanitizePhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : '9999999999';
};

// @desc    Create a Stripe PaymentIntent for the current cart total
// @route   POST /api/payments/create-payment-intent
// @access  Private
export const createPaymentIntent = asyncHandler(async (req, res) => {
  if (!isStripeConfigured) {
    throw ApiError.badRequest('Online card payments are not configured on this server. Please choose Cash on Delivery.');
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || !cart.items.length) {
    throw ApiError.badRequest('Your cart is empty');
  }

  const pricingItems = cart.items.map((item) => ({
    price: item.product.price,
    discountPrice: item.product.discountPrice,
    quantity: item.quantity,
  }));

  const { totalPrice } = calculateOrderTotals({
    items: pricingItems,
    coupon: cart.coupon?.code ? cart.coupon : null,
  });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalPrice * 100),
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: { userId: req.user._id.toString() },
  });

  sendSuccess(res, 200, 'Payment intent created', {
    clientSecret: paymentIntent.client_secret,
    amount: totalPrice,
    publishableKeyRequired: true,
  });
});

// @desc    Create a Cashfree Order (and payment session) for the current cart total
// @route   POST /api/payments/cashfree/create-order
// @access  Private
export const createCashfreeOrder = asyncHandler(async (req, res) => {
  if (!isCashfreeConfigured) {
    throw ApiError.badRequest('Cashfree payments are not configured on this server. Please choose another payment method.');
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || !cart.items.length) {
    throw ApiError.badRequest('Your cart is empty');
  }

  const pricingItems = cart.items.map((item) => ({
    price: item.product.price,
    discountPrice: item.product.discountPrice,
    quantity: item.quantity,
  }));

  const { totalPrice } = calculateOrderTotals({
    items: pricingItems,
    coupon: cart.coupon?.code ? cart.coupon : null,
  });

  // The checkout page sends the name/email/phone the customer just typed
  // into step 1, since Cashfree requires a phone number up front (unlike
  // Stripe, where prefill data is optional). Falls back to the
  // account profile if the request omits them.
  const { fullName, email, phone } = req.body;

  // Cashfree order_id allows only letters, digits, '_' and '-', max 45
  // chars - a 24-char ObjectId plus a 13-digit timestamp fits comfortably.
  const cashfreeOrderId = `${cart._id}_${Date.now()}`;

  const response = await cashfree.PGCreateOrder({
    order_id: cashfreeOrderId,
    order_amount: totalPrice,
    order_currency: CASHFREE_CURRENCY,
    customer_details: {
      customer_id: req.user._id.toString(),
      customer_name: fullName || req.user.name || 'Customer',
      customer_email: email || req.user.email || '',
      customer_phone: sanitizePhone(phone || req.user.phone),
    },
  });

  const order = response.data;

  sendSuccess(res, 200, 'Cashfree order created', {
    orderId: order.order_id,
    paymentSessionId: order.payment_session_id,
    amount: order.order_amount,
    currency: order.order_currency,
    mode: process.env.CASHFREE_ENV === 'PRODUCTION' ? 'production' : 'sandbox',
  });
});

/**
 * Verifies a PaymentIntent succeeded and its amount matches the order
 * total (within 1 cent, to absorb rounding) before an order is created.
 * Exported for use by orderController - not an HTTP handler itself.
 */
export const verifyPaymentIntent = async (paymentIntentId, expectedTotal) => {
  if (!isStripeConfigured) {
    return { success: false, message: 'Stripe is not configured on this server' };
  }
  if (!paymentIntentId) {
    return { success: false, message: 'Missing paymentIntentId' };
  }

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status !== 'succeeded') {
      return { success: false, message: `Payment has not completed (status: ${intent.status})` };
    }

    const expectedCents = Math.round(expectedTotal * 100);
    if (Math.abs(intent.amount - expectedCents) > 1) {
      return { success: false, message: 'Payment amount does not match order total' };
    }

    return {
      success: true,
      paymentResult: {
        id: intent.id,
        status: intent.status,
        update_time: new Date().toISOString(),
        email_address: intent.receipt_email || '',
      },
    };
  } catch (error) {
    return { success: false, message: `Unable to verify payment: ${error.message}` };
  }
};

/**
 * Verifies a Cashfree order actually succeeded before an order is created.
 * Cashfree's Drop-in checkout doesn't hand the browser a cryptographic
 * proof of payment the way a Stripe payment element can - it only reports
 * that the checkout closed, or an optional (non-authoritative)
 * paymentDetails object. So the only trustworthy signal is asking
 * Cashfree's own API for this order's current status server-side, and
 * confirming its amount matches - the same "never trust the client alone"
 * principle as verifyPaymentIntent above.
 * Exported for use by orderController - not an HTTP handler itself.
 */
export const verifyCashfreePayment = async (cashfreeOrderId, expectedTotal) => {
  if (!isCashfreeConfigured) {
    return { success: false, message: 'Cashfree is not configured on this server' };
  }
  if (!cashfreeOrderId) {
    return { success: false, message: 'Missing Cashfree order id' };
  }

  try {
    const response = await cashfree.PGFetchOrder(cashfreeOrderId);
    const order = response.data;

    if (order.order_status !== 'PAID') {
      return { success: false, message: `Payment has not completed (order status: ${order.order_status})` };
    }

    if (Math.abs(order.order_amount - expectedTotal) > 0.01) {
      return { success: false, message: 'Payment amount does not match order total' };
    }

    return {
      success: true,
      paymentResult: {
        id: order.order_id,
        status: order.order_status,
        update_time: new Date().toISOString(),
        email_address: order.customer_details?.customer_email || '',
      },
    };
  } catch (error) {
    return { success: false, message: `Unable to verify payment: ${error.response?.data?.message || error.message}` };
  }
};

// @desc    Stripe webhook endpoint (payment confirmations, refunds, etc.)
// @route   POST /api/payments/webhook
// @access  Public (verified via Stripe signature)
export const stripeWebhook = asyncHandler(async (req, res) => {
  if (!isStripeConfigured || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(200).json({ received: true, note: 'Webhook secret not configured; ignoring.' });
  }

  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).send(`Webhook signature verification failed: ${error.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object;
      await Order.updateMany(
        { 'paymentResult.id': intent.id },
        { $set: { paymentStatus: 'paid' } }
      );
      break;
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object;
      await Order.updateMany(
        { 'paymentResult.id': intent.id },
        { $set: { paymentStatus: 'failed' } }
      );
      break;
    }
    default:
      break;
  }

  res.status(200).json({ received: true });
});

// @desc    Cashfree webhook endpoint (payment confirmations, refunds, etc.)
// @route   POST /api/payments/cashfree-webhook
// @access  Public (verified via Cashfree signature)
export const cashfreeWebhook = asyncHandler(async (req, res) => {
  if (!isCashfreeConfigured) {
    return res.status(200).json({ received: true, note: 'Cashfree not configured; ignoring.' });
  }

  try {
    cashfree.PGVerifyWebhookSignature(
      req.headers['x-webhook-signature'],
      req.body.toString(),
      req.headers['x-webhook-timestamp']
    );
  } catch (error) {
    return res.status(400).send(`Webhook signature verification failed: ${error.message}`);
  }

  const event = JSON.parse(req.body);

  switch (event.type) {
    case 'PAYMENT_SUCCESS_WEBHOOK': {
      const orderId = event.data?.order?.order_id;
      if (orderId) {
        await Order.updateMany({ 'paymentResult.id': orderId }, { $set: { paymentStatus: 'paid' } });
      }
      break;
    }
    case 'PAYMENT_FAILED_WEBHOOK': {
      const orderId = event.data?.order?.order_id;
      if (orderId) {
        await Order.updateMany({ 'paymentResult.id': orderId }, { $set: { paymentStatus: 'failed' } });
      }
      break;
    }
    default:
      break;
  }

  res.status(200).json({ received: true });
});

export { isStripeConfigured, isCashfreeConfigured };