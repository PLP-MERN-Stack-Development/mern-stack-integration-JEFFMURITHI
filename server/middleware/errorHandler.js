// server/middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(err); // keep for dev
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // in dev include stack:
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
};
