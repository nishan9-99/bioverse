const rateLimit = require("express-rate-limit");

// ── Global error handler ──────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    message = Object.values(err.errors).map((e) => e.message).join(", ");
    statusCode = 400;
  }

  // JWT error
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token.";
    statusCode = 401;
  }

  res.status(statusCode).json({ success: false, message });
};

// ── Rate limiter for auth routes ──────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: "Too many requests. Please try again later." },
});

// ── Rate limiter for AI routes ────────────────────────────────
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, message: "Too many AI requests. Please slow down." },
});

module.exports = { errorHandler, authLimiter, aiLimiter };
