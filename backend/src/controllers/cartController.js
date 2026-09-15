import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { buildCartResponse } from '../utils/cartHelpers.js';

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// @desc    Get the logged-in user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate('items.product');
  sendSuccess(res, 200, 'Cart fetched successfully', buildCartResponse(cart));
});

// @desc    Add a product to the cart (or increase quantity if already present)
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId || quantity < 1) {
    throw ApiError.badRequest('A valid productId and quantity are required');
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw ApiError.notFound('Product not found');
  if (product.stock < 1) throw ApiError.badRequest('This product is out of stock');

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find((item) => item.product.toString() === productId);

  const requestedQty = (existingItem ? existingItem.quantity : 0) + Number(quantity);
  if (requestedQty > product.stock) {
    throw ApiError.badRequest(`Only ${product.stock} unit(s) of this product are available`);
  }

  if (existingItem) {
    existingItem.quantity = requestedQty;
  } else {
    cart.items.push({
      product: productId,
      quantity: Number(quantity),
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
    });
  }

  await cart.save();
  await cart.populate('items.product');

  sendSuccess(res, 200, 'Product added to cart', buildCartResponse(cart));
});

// @desc    Update the quantity of a cart item
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) throw ApiError.badRequest('Quantity must be at least 1');

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw ApiError.notFound('Cart item not found');

  const product = await Product.findById(item.product);
  if (!product) throw ApiError.notFound('Product no longer exists');
  if (quantity > product.stock) {
    throw ApiError.badRequest(`Only ${product.stock} unit(s) of this product are available`);
  }

  item.quantity = Number(quantity);
  await cart.save();
  await cart.populate('items.product');

  sendSuccess(res, 200, 'Cart updated', buildCartResponse(cart));
});

// @desc    Remove an item from the cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw ApiError.notFound('Cart item not found');

  item.deleteOne();
  await cart.save();
  await cart.populate('items.product');

  sendSuccess(res, 200, 'Item removed from cart', buildCartResponse(cart));
});

// @desc    Clear the entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.coupon = { code: null, discountType: null, discountValue: 0 };
  await cart.save();

  sendSuccess(res, 200, 'Cart cleared', buildCartResponse(cart));
});

// @desc    Apply a coupon code to the cart
// @route   POST /api/cart/apply-coupon
// @access  Private
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) throw ApiError.badRequest('Coupon code is required');

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) throw ApiError.notFound('Invalid coupon code');

  const cart = await getOrCreateCart(req.user._id);
  await cart.populate('items.product');

  if (!cart.items.length) throw ApiError.badRequest('Your cart is empty');

  const { subtotal } = buildCartResponse(cart);
  const { valid, reason } = coupon.isValidForUse(subtotal);
  if (!valid) throw ApiError.badRequest(reason);

  cart.coupon = {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
  };
  await cart.save();
  await cart.populate('items.product');

  sendSuccess(res, 200, 'Coupon applied successfully', buildCartResponse(cart));
});

// @desc    Remove the coupon from the cart
// @route   DELETE /api/cart/coupon
// @access  Private
export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.coupon = { code: null, discountType: null, discountValue: 0 };
  await cart.save();
  await cart.populate('items.product');

  sendSuccess(res, 200, 'Coupon removed', buildCartResponse(cart));
});
