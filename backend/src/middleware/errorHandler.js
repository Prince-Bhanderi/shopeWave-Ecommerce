import ApiError from '../utils/ApiError.js';

/**
 * Normalizes known error types (Mongoose, JWT, Multer, etc.) into ApiError
 * instances so the response shape is always consistent.
 */
const normalizeError = (err) => {
  if (err instanceof ApiError) return err;

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    return ApiError.notFound(`Resource not found with id: ${err.value}`);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    return ApiError.conflict(`${field} '${value}' is already in use`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => val.message);
    return ApiError.badRequest('Validation failed', errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiError.unauthorized('Invalid authentication token');
  }
  if (err.name === 'TokenExpiredError') {
    return ApiError.unauthorized('Authentication token has expired');
  }

  // Multer upload errors
  if (err.name === 'MulterError') {
    return ApiError.badRequest(`File upload error: ${err.message}`);
  }

  // Stripe errors
  if (err.type && err.type.startsWith('Stripe')) {
    return ApiError.badRequest(err.message || 'Payment processing error');
  }

  return null;
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const normalized = normalizeError(err) || err;

  const statusCode = normalized.statusCode && normalized.statusCode >= 400 ? normalized.statusCode : 500;
  const message = normalized.message || 'Something went wrong on the server';
  const errors = normalized.errors || [];

  if (statusCode === 500) {
    console.error('UNHANDLED ERROR:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
