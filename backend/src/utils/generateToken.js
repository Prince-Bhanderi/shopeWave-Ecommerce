import jwt from 'jsonwebtoken';

/**
 * Generates a signed JWT carrying the user id and role.
 */
export const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Sets the JWT as an httpOnly cookie (used in addition to returning the
 * token in the JSON body, so the SPA can support either storage strategy)
 * and sends the standard { user, token } auth payload.
 */
export const sendTokenResponse = (res, statusCode, user, message, sendResponse) => {
  const token = generateToken(user._id, user.role);

  const cookieExpiresDays = Number(process.env.JWT_COOKIE_EXPIRES_IN || 7);
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiresDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  return sendResponse(res, statusCode, message, {
    token,
    user: user.toSafeObject ? user.toSafeObject() : user,
  });
};
