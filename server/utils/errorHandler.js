/**
 * Secure error response utility
 * Prevents information disclosure in production
 */
export function sendErrorResponse(res, statusCode, message, error = null) {
  const isProduction = process.env.NODE_ENV === "production";
  
  const response = {
    message,
    ...(isProduction ? {} : { error: error?.message, stack: error?.stack })
  };
  
  res.status(statusCode).json(response);
}
