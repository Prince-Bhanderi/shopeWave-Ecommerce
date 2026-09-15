import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

/**
 * Extracts the JWT from the Authorization header or the httpOnly cookie,
 * verifies it, and attaches the authenticated user to req.user.
 */
export const protect = asyncHandler(async (req, _res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw ApiError.unauthorized('You must be logged in to access this resource');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Your session has expired. Please log in again');
    }
    throw ApiError.unauthorized('Invalid authentication token');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw ApiError.unauthorized('The user belonging to this token no longer exists');
  }

  if (user.isBlocked) {
    throw ApiError.forbidden('Your account has been blocked. Please contact support');
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    throw ApiError.unauthorized('Password was changed recently. Please log in again');
  }

  req.user = user;
  next();
});

/**
 * Populates req.user when a valid token is present, but never blocks the
 * request when it is absent or invalid. Useful for endpoints that behave
 * differently for guests vs. logged-in users (none currently required, but
 * kept for future public/optional-auth endpoints).
 */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && !user.isBlocked) req.user = user;
  } catch (error) {
    // ignore invalid token for optional auth
  }
  next();
});

/**
 * Role-based authorization guard. Must run after `protect`.
 * Usage: authorize('admin') or authorize('admin', 'customer')
 */
export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('You must be logged in to access this resource');
  }
  if (!roles.includes(req.user.role)) {
    throw ApiError.forbidden('You do not have permission to perform this action');
  }
  next();
};
