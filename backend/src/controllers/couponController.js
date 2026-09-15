import asyncHandler from 'express-async-handler';
import Coupon from '../models/Coupon.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';

// @desc    List all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  sendSuccess(res, 200, 'Coupons fetched successfully', coupons);
});

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = asyncHandler(async (req, res) => {
  const code = req.body.code.trim().toUpperCase();
  const existing = await Coupon.findOne({ code });
  if (existing) throw ApiError.conflict('A coupon with this code already exists');

  const coupon = await Coupon.create({ ...req.body, code });
  sendSuccess(res, 201, 'Coupon created successfully', coupon);
});

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw ApiError.notFound('Coupon not found');

  if (req.body.code) req.body.code = req.body.code.trim().toUpperCase();
  Object.assign(coupon, req.body);
  await coupon.save();

  sendSuccess(res, 200, 'Coupon updated successfully', coupon);
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw ApiError.notFound('Coupon not found');

  await coupon.deleteOne();
  sendSuccess(res, 200, 'Coupon deleted successfully');
});

// @desc    Quickly check whether a coupon code is currently valid
// @route   GET /api/coupons/check/:code
// @access  Private
export const checkCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.params.code.trim().toUpperCase() });
  if (!coupon) throw ApiError.notFound('Invalid coupon code');

  const { valid, reason } = coupon.isValidForUse(0);
  sendSuccess(res, 200, 'Coupon checked', {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minimumPurchase: coupon.minimumPurchase,
    valid,
    reason: reason || null,
  });
});
