import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    List all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find(req.query.all === 'true' ? {} : { isActive: true }).sort({ name: 1 });

  // Attach a product count for nicer admin/category menus without N+1 queries
  const counts = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));

  const withCounts = categories.map((cat) => ({
    ...cat.toObject(),
    productCount: countMap[cat._id.toString()] || 0,
  }));

  sendSuccess(res, 200, 'Categories fetched successfully', withCounts);
});

// @desc    Get a single category by id or slug
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = isValidId(id) ? { _id: id } : { slug: id };

  const category = await Category.findOne(query);
  if (!category) throw ApiError.notFound('Category not found');

  sendSuccess(res, 200, 'Category fetched successfully', category);
});

// @desc    Get products belonging to a category
// @route   GET /api/categories/:id/products
// @access  Public
export const getCategoryProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = isValidId(id) ? { _id: id } : { slug: id };

  const category = await Category.findOne(query);
  if (!category) throw ApiError.notFound('Category not found');

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));

  const [products, total] = await Promise.all([
    Product.find({ category: category._id, isActive: true })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Product.countDocuments({ category: category._id, isActive: true }),
  ]);

  sendSuccess(res, 200, 'Category products fetched successfully', products, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const existing = await Category.findOne({ name: new RegExp(`^${req.body.name}$`, 'i') });
  if (existing) throw ApiError.conflict('A category with this name already exists');

  const category = await Category.create(req.body);
  sendSuccess(res, 201, 'Category created successfully', category);
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  Object.assign(category, req.body);
  await category.save();

  sendSuccess(res, 200, 'Category updated successfully', category);
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    throw ApiError.badRequest(
      `Cannot delete this category because it has ${productCount} associated product(s). Reassign or delete them first.`
    );
  }

  await category.deleteOne();
  sendSuccess(res, 200, 'Category deleted successfully');
});
