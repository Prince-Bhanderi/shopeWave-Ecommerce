/**
 * Sends a consistent success envelope for every API response:
 * { success: true, message, data }
 */
class ApiResponse {
  constructor(res, statusCode, message, data = null, meta = undefined) {
    const body = { success: true, message };
    if (data !== null) body.data = data;
    if (meta !== undefined) body.meta = meta;
    return res.status(statusCode).json(body);
  }
}

export const sendSuccess = (res, statusCode, message, data = null, meta = undefined) => {
  const body = { success: true, message };
  if (data !== null && data !== undefined) body.data = data;
  if (meta !== undefined) body.meta = meta;
  return res.status(statusCode).json(body);
};

export default ApiResponse;
