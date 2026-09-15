import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';

// @desc    Get the logged-in user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    select: 'name slug price discountPrice images rating numReviews stock brand',
  });

  sendSuccess(res, 200, 'Wishlist fetched successfully', user.wishlist);
});

// @desc    Add a product to the wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');

  const user = await User.findById(req.user._id);
  const alreadyExists = user.wishlist.some((id) => id.toString() === productId);

  if (!alreadyExists) {
    user.wishlist.push(productId);
    await user.save();
  }

  await user.populate({
    path: 'wishlist',
    select: 'name slug price discountPrice images rating numReviews stock brand',
  });

  sendSuccess(res, 200, 'Product added to wishlist', user.wishlist);
});

// @desc    Remove a product from the wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);
  user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  await user.save();

  await user.populate({
    path: 'wishlist',
    select: 'name slug price discountPrice images rating numReviews stock brand',
  });

  sendSuccess(res, 200, 'Product removed from wishlist', user.wishlist);
});

// @desc    Move a wishlist item into the cart
// @route   POST /api/wishlist/:productId/move-to-cart
// @access  Private
export const moveToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw ApiError.notFound('Product not found');
  if (product.stock < 1) throw ApiError.badRequest('This product is out of stock');

  const user = await User.findById(req.user._id);

  let cart = await Cart.findOne({ user: user._id });
  if (!cart) cart = await Cart.create({ user: user._id, items: [] });

  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({
      product: productId,
      quantity: 1,
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
    });
  }
  await cart.save();

  user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  await user.save();

  sendSuccess(res, 200, 'Product moved to cart');
});
