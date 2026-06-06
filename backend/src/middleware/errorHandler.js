// src/middleware/errorHandler.js

// 404 handler – catches unmatched routes
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Centralized error handler – returns JSON with proper status
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    // In production we hide stack traces
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
