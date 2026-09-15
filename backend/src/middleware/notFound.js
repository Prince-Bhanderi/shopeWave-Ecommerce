import ApiError from '../utils/ApiError.js';

/**
 * Catches any request that did not match a defined route.
 */
const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

export default notFound;
