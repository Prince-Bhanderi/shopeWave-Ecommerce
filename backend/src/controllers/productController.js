import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Builds the Mongoose sort object from the `sort` query param.
 */
const buildSort = (sort) => {
  switch (sort) {
    case 'price-asc':
      return { price: 1 };
    case 'price-desc':
      return { price: -1 };
    case 'rating':
      return { rating: -1, numReviews: -1 };
    case 'popular':
      return { numSold: -1, numReviews: -1 };
    case 'name-asc':
      return { name: 1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
};

// @desc    List products with search, filters, sorting & pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    sort,
    page = 1,
    limit = 12,
    featured,
    inStock,
  } = req.query;

  const filter = { isActive: true };

  if (keyword) {
    filter.$text = { $search: keyword };
  }

  if (category) {
    if (isValidId(category)) {
      filter.category = category;
    } else {
      const categoryDoc = await Category.findOne({ slug: category });
      filter.category = categoryDoc ? categoryDoc._id : null; // null => no results
    }
  }

  if (brand) {
    const brands = brand.split(',').map((b) => b.trim()).filter(Boolean);
    if (brands.length) filter.brand = { $in: brands.map((b) => new RegExp(`^${b}$`, 'i')) };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (rating) {
    filter.rating = { $gte: Number(rating) };
  }

  if (featured === 'true') {
    filter.featured = true;
  }

  if (inStock === 'true') {
    filter.stock = { $gt: 0 };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const [products, total, brands] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').sort(buildSort(sort)).skip(skip).limit(limitNum),
    Product.countDocuments(filter),
    Product.distinct('brand', { isActive: true }),
  ]);

  sendSuccess(res, 200, 'Products fetched successfully', products, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
    availableBrands: brands.sort(),
  });
});

// @desc    Get a single product by id or slug (+ related products)
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const query = isValidId(id) ? { _id: id } : { slug: id };
  const product = await Product.findOne(query).populate('category', 'name slug');

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  const relatedProducts = await Product.find({
    category: product.category?._id,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(8)
    .select('name slug price discountPrice images rating numReviews stock');

  sendSuccess(res, 200, 'Product fetched successfully', { product, relatedProducts });
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) throw ApiError.badRequest('Selected category does not exist');

  const existingSku = await Product.findOne({ sku: req.body.sku?.toUpperCase() });
  if (existingSku) throw ApiError.conflict('A product with this SKU already exists');

  const product = await Product.create(req.body);
  sendSuccess(res, 201, 'Product created successfully', product);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) throw ApiError.badRequest('Selected category does not exist');
  }

  if (req.body.sku && req.body.sku.toUpperCase() !== product.sku) {
    const existingSku = await Product.findOne({ sku: req.body.sku.toUpperCase(), _id: { $ne: product._id } });
    if (existingSku) throw ApiError.conflict('A product with this SKU already exists');
  }

  Object.assign(product, req.body);
  await product.save();

  sendSuccess(res, 200, 'Product updated successfully', product);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  await product.deleteOne();
  sendSuccess(res, 200, 'Product deleted successfully');
});

// @desc    Update stock only (quick admin action)
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin
export const updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;
  if (stock === undefined || Number(stock) < 0) {
    throw ApiError.badRequest('A valid, non-negative stock value is required');
  }

  const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true, runValidators: true });
  if (!product) throw ApiError.notFound('Product not found');

  sendSuccess(res, 200, 'Stock updated successfully', product);
});
