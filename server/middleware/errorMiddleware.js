// ─── Global Error Handler Middleware ─────────────────────────────────────────
//
// In Express, a middleware function with 4 parameters (err, req, res, next)
// is treated as an error handler. Any route can trigger this by calling
// next(err) or by throwing an error inside an async handler.
//
// Having a central error handler means we don't need try/catch in every route
// that returns the same kind of error response. Keep it DRY.

export const errorHandler = (err, req, res, next) => {
  // If a status code was set on the response already, use it.
  // Otherwise default to 500 (Internal Server Error).
  const statusCode = res.statusCode && res.statusCode !== 200
    ? res.statusCode
    : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong',
    // Show the error stack trace only in development — never in production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
