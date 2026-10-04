const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/error.middleware");
const {
  register,
  login,
  getMe,
  updateProfile,
  updateLevel,
  updatePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

// Public routes
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.put("/reset-password/:token", authLimiter, resetPassword);

// Protected routes (require JWT)
router.get("/me", protect, getMe);
router.put("/update", protect, updateProfile);
router.put("/level", protect, updateLevel);
router.put("/password", protect, updatePassword);

module.exports = router;
