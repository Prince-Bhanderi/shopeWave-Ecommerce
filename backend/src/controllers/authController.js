import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { sendTokenResponse } from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = await User.create({ name, email, password, phone });

  sendTokenResponse(res, 201, user, 'Registration successful', sendSuccess);
});

// @desc    Login with email & password
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.isBlocked) {
    throw ApiError.forbidden('Your account has been blocked. Please contact support');
  }

  sendTokenResponse(res, 200, user, 'Login successful', sendSuccess);
});

// @desc    Logout - clears the auth cookie (client also drops its local token)
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (_req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  sendSuccess(res, 200, 'Logged out successfully');
});

// @desc    Get the currently authenticated user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price discountPrice images slug');
  sendSuccess(res, 200, 'Current user fetched', user.toSafeObject());
});

// @desc    Update profile (name, phone, avatar, addresses)
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'avatar', 'address'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (req.body.email && req.body.email !== req.user.email) {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) throw ApiError.conflict('This email is already in use');
    updates.email = req.body.email;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, 200, 'Profile updated successfully', user.toSafeObject());
});

// @desc    Change password while logged in
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(res, 200, user, 'Password changed successfully', sendSuccess);
});

// @desc    Request a password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond with a generic success message to avoid leaking which
  // emails are registered.
  const genericMessage = 'If an account with that email exists, a password reset link has been sent';

  if (!user) {
    return sendSuccess(res, 200, genericMessage);
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const message = `You requested a password reset. Submit this token from the reset password page: ${resetToken}\n\nOr open this link: ${resetUrl}\n\nThis link expires in 10 minutes. If you did not request this, please ignore this email.`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'ShopWave - Password Reset Request',
      text: message,
      html: `<p>${message.replace(/\n/g, '<br/>')}</p>`,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw ApiError.internal('Failed to send password reset email. Please try again later');
  }

  sendSuccess(res, 200, genericMessage);
});

// @desc    Reset password using the token emailed to the user
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw ApiError.badRequest('Password reset token is invalid or has expired');
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(res, 200, user, 'Password reset successful', sendSuccess);
});
