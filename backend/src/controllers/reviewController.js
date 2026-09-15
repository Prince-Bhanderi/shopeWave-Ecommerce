import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';

/**
 * Recomputes a product's average rating and review count. Called whenever
 * a review is created, updated, or deleted so the Product document always
 * reflects accurate aggregate values.
 */
export const recalculateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    rating: stats.length ? stats[0].avgRating : 0,
    numReviews: stats.length ? stats[0].count : 0,
  });
};

// @desc    Get the most recent high-rated reviews across all products
//          (used for the homepage "Customer Reviews" testimonial section)
// @route   GET /api/reviews/recent
// @access  Public
export const getRecentReviews = asyncHandler(async (req, res) => {
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 6));

  const reviews = await Review.find({ rating: { $gte: 4 } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name avatar')
    .populate('product', 'name slug images');

  sendSuccess(res, 200, 'Recent reviews fetched successfully', reviews);
});

// @desc    Get all reviews for a product (+ rating distribution)
// @route   GET /api/products/:productId/reviews
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const [reviews, total, distribution] = await Promise.all([
    Review.find({ product: productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Review.countDocuments({ product: productId }),
    Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]),
  ]);

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  distribution.forEach((d) => {
    ratingDistribution[d._id] = d.count;
  });

  sendSuccess(res, 200, 'Reviews fetched successfully', reviews, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    averageRating: product.rating,
    numReviews: product.numReviews,
    ratingDistribution,
  });
});

// @desc    Create a review (only verified purchasers may review)
// @route   POST /api/products/:productId/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment, title } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');

  const existingReview = await Review.findOne({ user: req.user._id, product: productId });
  if (existingReview) {
    throw ApiError.conflict('You have already reviewed this product. You can edit your existing review instead.');
  }

  const purchaseOrder = await Order.findOne({
    user: req.user._id,
    isCancelled: false,
    'orderItems.product': productId,
  }).sort({ createdAt: -1 });

  if (!purchaseOrder) {
    throw ApiError.forbidden('Only customers who purchased this product can leave a review');
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    order: purchaseOrder._id,
    rating,
    comment,
    title,
  });

  await recalculateProductRating(product._id);

  const populated = await review.populate('user', 'name avatar');
  sendSuccess(res, 201, 'Review submitted successfully', populated);
});

// @desc    Update your own review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');

  if (review.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You can only edit your own reviews');
  }

  if (req.body.rating !== undefined) review.rating = req.body.rating;
  if (req.body.comment !== undefined) review.comment = req.body.comment;
  if (req.body.title !== undefined) review.title = req.body.title;
  await review.save();

  await recalculateProductRating(review.product);

  sendSuccess(res, 200, 'Review updated successfully', review);
});

// @desc    Delete your own review (or any review, if admin)
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('You can only delete your own reviews');
  }

  const { product } = review;
  await review.deleteOne();
  await recalculateProductRating(product);

  sendSuccess(res, 200, 'Review deleted successfully');
});
