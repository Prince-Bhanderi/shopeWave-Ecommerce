import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { calculateOrderTotals } from '../utils/calculatePrices.js';
import { verifyPaymentIntent, verifyCashfreePayment } from './paymentController.js';

// @desc    Create a new order from the current cart (checkout)
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
    const { shippingAddress, paymentMethod, paymentIntentId, cashfreeOrderId } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || !cart.items.length) {
    throw ApiError.badRequest('Your cart is empty');
  }

  // Re-validate stock for every line item at the moment of checkout
  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      throw ApiError.badRequest(`One of the products in your cart is no longer available`);
    }
    if (product.stock < item.quantity) {
      throw ApiError.badRequest(`Insufficient stock for "${product.name}". Only ${product.stock} left.`);
    }
  }

  const pricingItems = cart.items.map((item) => ({
    price: item.product.price,
    discountPrice: item.product.discountPrice,
    quantity: item.quantity,
  }));

  let coupon = null;
  if (cart.coupon?.code) {
    coupon = await Coupon.findOne({ code: cart.coupon.code });
  }

  const { subtotal, discount, shippingCost, tax, totalPrice } = calculateOrderTotals({
    items: pricingItems,
    coupon: cart.coupon?.code ? cart.coupon : null,
  });

  let paymentStatus = 'pending';
  let paymentResult;

  if (paymentMethod === 'Stripe') {
    const verification = await verifyPaymentIntent(paymentIntentId, totalPrice);
    if (!verification.success) {
      throw ApiError.badRequest(verification.message || 'Payment verification failed');
    }
    paymentStatus = 'paid';
    paymentResult = verification.paymentResult;
    } else if (paymentMethod === 'Cashfree') {
    const verification = await verifyCashfreePayment(cashfreeOrderId, totalPrice);
    if (!verification.success) {
      throw ApiError.badRequest(verification.message || 'Payment verification failed');
    }
    paymentStatus = 'paid';
    paymentResult = verification.paymentResult;
  }

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.images?.[0]?.url || '',
    price: item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price,
    quantity: item.quantity,
  }));

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    paymentStatus,
    paymentResult,
    subtotal,
    discount,
    shippingCost,
    tax,
    totalPrice,
    couponCode: cart.coupon?.code || null,
    statusHistory: [{ status: 'Pending' }],
  });

  // Reduce stock & track sales; done sequentially and defensively so a
  // partial failure never leaves stock counts corrupted.
  await Promise.all(
    cart.items.map((item) =>
      Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, numSold: item.quantity },
      })
    )
  );

  if (coupon) {
    coupon.usedCount += 1;
    await coupon.save();
  }

  cart.items = [];
  cart.coupon = { code: null, discountType: null, discountValue: 0 };
  await cart.save();

  sendSuccess(res, 201, 'Order placed successfully', order);
});

// @desc    Get the logged-in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const filter = { user: req.user._id };
  if (req.query.status) filter.orderStatus = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Orders fetched successfully', orders, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
});

// @desc    Get a single order by id
// @route   GET /api/orders/:id
// @access  Private (owner or admin)
export const getOrderById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ApiError.notFound('Order not found');
  }

  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) throw ApiError.notFound('Order not found');

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw ApiError.forbidden('You do not have permission to view this order');
  }

  sendSuccess(res, 200, 'Order fetched successfully', order);
});

// @desc    Cancel an order (customer-initiated, only while eligible)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw ApiError.forbidden('You do not have permission to cancel this order');
  }

  if (!order.isCancellable()) {
    throw ApiError.badRequest(
      `This order can no longer be cancelled because it is already "${order.orderStatus}"`
    );
  }

  order.isCancelled = true;
  order.orderStatus = 'Cancelled';
  order.cancelReason = req.body.reason || 'Cancelled by customer';
  order.cancelledAt = new Date();
  order.statusHistory.push({ status: 'Cancelled' });
  if (order.paymentStatus === 'paid') order.paymentStatus = 'refunded';
  await order.save();

  // Restock items
  await Promise.all(
    order.orderItems.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, numSold: -item.quantity },
      })
    )
  );

  sendSuccess(res, 200, 'Order cancelled successfully', order);
});
