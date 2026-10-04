const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never returned in queries by default
    },
    avatar: {
      type: String,
      default: "",
    },
    level: {
      type: String,
      enum: ["school", "college", "medical"],
      default: "college",
    },
    // ── Progress ──────────────────────────────────
    organsExplored: [
      {
        type: String, // organ slug e.g. "brain", "heart"
      },
    ],
    totalQuizzesTaken: {
      type: Number,
      default: 0,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    completionPercentage: {
      type: Number,
      default: 0,
    },
    // ── Streak ────────────────────────────────────
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
    // ── Achievements ──────────────────────────────
    badges: [
      {
        name: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    // ── Auth ──────────────────────────────────────
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update streak on login
UserSchema.methods.updateStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!this.lastActiveDate) {
    this.currentStreak = 1;
  } else {
    const last = new Date(this.lastActiveDate);
    last.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return; // already logged in today
    if (diffDays === 1) {
      this.currentStreak += 1;
    } else {
      this.currentStreak = 1; // streak broken
    }
  }

  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  this.lastActiveDate = today;
};

module.exports = mongoose.model("User", UserSchema);
