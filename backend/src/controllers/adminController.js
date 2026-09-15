import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';

const LOW_STOCK_THRESHOLD = 5;

// @desc    Aggregate dashboard statistics + chart data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const days = Math.min(90, Math.max(7, parseInt(req.query.days, 10) || 30));
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    revenueAgg,
    unitsSoldAgg,
    recentOrders,
    bestSellingProducts,
    lowStockProducts,
    salesOverTime,
    orderStatusBreakdown,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { isCancelled: false } },
      { $group: { _id: null, revenue: { $sum: '$totalPrice' } } },
    ]),
    Order.aggregate([
      { $match: { isCancelled: false } },
      { $unwind: '$orderItems' },
      { $group: { _id: null, units: { $sum: '$orderItems.quantity' } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(8).populate('user', 'name email'),
    Product.find().sort({ numSold: -1 }).limit(5).select('name images price numSold stock'),
    Product.find({ stock: { $lte: LOW_STOCK_THRESHOLD } }).sort({ stock: 1 }).limit(10).select('name images stock sku'),
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, isCancelled: false } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
          units: { $sum: { $sum: '$orderItems.quantity' } },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
  ]);

  sendSuccess(res, 200, 'Dashboard stats fetched successfully', {
    totals: {
      totalUsers,
      totalProducts,
      totalOrders,
      revenue: revenueAgg[0]?.revenue || 0,
      totalSales: unitsSoldAgg[0]?.units || 0,
    },
    recentOrders,
    bestSellingProducts,
    lowStockProducts,
    salesOverTime: salesOverTime.map((d) => ({ date: d._id, orders: d.orders, revenue: Math.round(d.revenue * 100) / 100, units: d.units })),
    orderStatusBreakdown: orderStatusBreakdown.map((s) => ({ status: s._id, count: s.count })),
  });
});

// @desc    List all orders (admin) with search/filter/pagination
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const { search, status, paymentStatus, page = 1, limit = 15 } = req.query;

  const filter = {};
  if (status) filter.orderStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (search) {
    filter.$or = [
      { orderNumber: new RegExp(search, 'i') },
      { 'shippingAddress.fullName': new RegExp(search, 'i') },
      { 'shippingAddress.email': new RegExp(search, 'i') },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Orders fetched successfully', orders, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
  });
});

// @desc    Get a single order (admin)
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
export const getAdminOrderById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw ApiError.notFound('Order not found');

  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) throw ApiError.notFound('Order not found');

  sendSuccess(res, 200, 'Order fetched successfully', order);
});

// @desc    Update order status (Pending/Processing/Shipped/Delivered/Cancelled)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    throw ApiError.badRequest(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  if (status === 'Cancelled' && !order.isCancelled) {
    order.isCancelled = true;
    order.cancelledAt = new Date();
    order.cancelReason = order.cancelReason || 'Cancelled by admin';
    await Promise.all(
      order.orderItems.map((item) =>
        Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, numSold: -item.quantity } })
      )
    );
  }

  if (status === 'Delivered') order.deliveredAt = new Date();

  order.orderStatus = status;
  order.statusHistory.push({ status });
  await order.save();

  sendSuccess(res, 200, 'Order status updated successfully', order);
});

// @desc    Update payment status (pending/paid/failed/refunded)
// @route   PUT /api/admin/orders/:id/payment-status
// @access  Private/Admin
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;
  const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
  if (!validStatuses.includes(paymentStatus)) {
    throw ApiError.badRequest(`Payment status must be one of: ${validStatuses.join(', ')}`);
  }

  const order = await Order.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true });
  if (!order) throw ApiError.notFound('Order not found');

  sendSuccess(res, 200, 'Payment status updated successfully', order);
});

// @desc    Cancel an order as admin
// @route   PUT /api/admin/orders/:id/cancel
// @access  Private/Admin
export const adminCancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  if (order.isCancelled) throw ApiError.badRequest('This order is already cancelled');
  if (order.orderStatus === 'Delivered') throw ApiError.badRequest('A delivered order cannot be cancelled');

  order.isCancelled = true;
  order.orderStatus = 'Cancelled';
  order.cancelReason = req.body.reason || 'Cancelled by admin';
  order.cancelledAt = new Date();
  order.statusHistory.push({ status: 'Cancelled' });
  if (order.paymentStatus === 'paid') order.paymentStatus = 'refunded';
  await order.save();

  await Promise.all(
    order.orderItems.map((item) =>
      Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, numSold: -item.quantity } })
    )
  );

  sendSuccess(res, 200, 'Order cancelled successfully', order);
});

// @desc    List all users (admin) with search/pagination
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 15 } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    User.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Users fetched successfully', users, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
  });
});

// @desc    Get a single user (admin)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  const orderCount = await Order.countDocuments({ user: user._id });
  const totalSpentAgg = await Order.aggregate([
    { $match: { user: user._id, isCancelled: false } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  sendSuccess(res, 200, 'User fetched successfully', {
    ...user.toSafeObject(),
    orderCount,
    totalSpent: totalSpentAgg[0]?.total || 0,
  });
});

// @desc    Change a user's role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['customer', 'admin'].includes(role)) {
    throw ApiError.badRequest('Role must be either customer or admin');
  }

  if (req.params.id === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot change your own role');
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw ApiError.notFound('User not found');

  sendSuccess(res, 200, 'User role updated successfully', user.toSafeObject());
});

// @desc    Block or unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
export const toggleBlockUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot block your own account');
  }

  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  user.isBlocked = req.body.isBlocked !== undefined ? Boolean(req.body.isBlocked) : !user.isBlocked;
  await user.save();

  sendSuccess(res, 200, `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, user.toSafeObject());
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  await user.deleteOne();
  sendSuccess(res, 200, 'User deleted successfully');
});

// @desc    Admin product listing (includes inactive products, low stock flag)
// @route   GET /api/admin/products
// @access  Private/Admin
export const getAdminProducts = asyncHandler(async (req, res) => {
  const { search, category, stockStatus, page = 1, limit = 15 } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { sku: new RegExp(search, 'i') },
      { brand: new RegExp(search, 'i') },
    ];
  }
  if (category) filter.category = category;
  if (stockStatus === 'out') filter.stock = 0;
  if (stockStatus === 'low') filter.stock = { $gt: 0, $lte: LOW_STOCK_THRESHOLD };
  if (stockStatus === 'in') filter.stock = { $gt: LOW_STOCK_THRESHOLD };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Products fetched successfully', products, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
  });
});
