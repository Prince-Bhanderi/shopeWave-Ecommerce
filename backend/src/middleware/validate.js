import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Runs after an array of express-validator checks and turns any
 * validation failures into a consistent 400 ApiError response.
 */
const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  next(ApiError.badRequest('Validation failed', formatted));
};

export default validate;
