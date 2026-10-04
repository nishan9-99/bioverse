const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");

// ── Generate JWT Token ────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// ── Send token response ───────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      level: user.level,
      avatar: user.avatar,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      organsExplored: user.organsExplored,
      totalQuizzesTaken: user.totalQuizzesTaken,
      completionPercentage: user.completionPercentage,
      badges: user.badges,
    },
  });
};

// ── @route  POST /api/auth/register ──────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, level } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please fill all required fields." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered." });
    }

    const user = await User.create({ name, email, password, level: level || "college" });
    user.updateStreak();
    await user.save();

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// ── @route  POST /api/auth/login ─────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please enter email and password." });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    user.updateStreak();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ── @route  GET /api/auth/me ─────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
        avatar: user.avatar,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        organsExplored: user.organsExplored,
        totalQuizzesTaken: user.totalQuizzesTaken,
        completionPercentage: user.completionPercentage,
        badges: user.badges,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── @route  PUT /api/auth/update ─────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {};
    if (req.body.name) fieldsToUpdate.name = req.body.name;
    if (req.body.level) fieldsToUpdate.level = req.body.level;
    if (req.body.avatar) fieldsToUpdate.avatar = req.body.avatar;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ── @route  PUT /api/auth/level ──────────────────────────────
const updateLevel = async (req, res, next) => {
  try {
    const { level } = req.body;
    if (!["school", "college", "medical"].includes(level)) {
      return res.status(400).json({ success: false, message: "Invalid level. Must be school, college, or medical." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.level = level;
    await user.save();

    res.json({ success: true, level: user.level });
  } catch (error) {
    next(error);
  }
};

// ── @route  PUT /api/auth/password ───────────────────────────
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password incorrect." });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ── @route  POST /api/auth/forgot-password ───────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const genericResponse = {
      success: true,
      message: "If an account exists for that email, a reset token has been issued.",
    };
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // No email service is wired up. The token is never sent back to the caller;
    // in development it is printed to the server console so the flow can be tested.
    // In production, deliver it by email instead.
    if (process.env.NODE_ENV !== "production") {
      console.log(`[dev] Password reset token for ${user.email}: ${resetToken}`);
    }

    res.status(200).json(genericResponse);
  } catch (error) {
    next(error);
  }
};

// ── @route  PUT /api/auth/reset-password/:token ──────────────
const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
    }

    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updateLevel,
  updatePassword,
  forgotPassword,
  resetPassword,
};
