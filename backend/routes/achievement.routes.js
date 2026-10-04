const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const User = require("../models/User");

// @route  GET /api/achievements
// @desc   Get user's unlocked and available achievement badges
router.get("/", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const ALL_AVAILABLE_BADGES = [
      { name: "First Discovery", icon: "🔭", desc: "Explored your very first human organ" },
      { name: "Anatomy Novice", icon: "🌱", desc: "Completed your first anatomical quiz" },
      { name: "Flawless Knowledge", icon: "💎", desc: "Scored 100% on any anatomy quiz" },
      { name: "Biology Scholar", icon: "🎓", desc: "Completed 5 or more quizzes" },
      { name: "Brain Specialist", icon: "🧠", desc: "Mastered neuroanatomy" },
      { name: "Heart Specialist", icon: "🫀", desc: "Mastered cardiovascular system" },
      { name: "Lungs Specialist", icon: "🫁", desc: "Mastered respiratory system" },
      { name: "Kidney Specialist", icon: "🫘", desc: "Mastered renal physiology" },
      { name: "Master of Anatomy", icon: "👑", desc: "Explored all core human systems" },
    ];

    const unlockedNames = (user.badges || []).map((b) => b.name);
    const badgesWithStatus = ALL_AVAILABLE_BADGES.map((badge) => ({
      ...badge,
      unlocked: unlockedNames.includes(badge.name),
      earnedAt: (user.badges || []).find((b) => b.name === badge.name)?.earnedAt || null,
    }));

    res.json({
      success: true,
      data: badgesWithStatus,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
