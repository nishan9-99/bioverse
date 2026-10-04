const User = require("../models/User");
const Organ = require("../models/Organ");

const TOTAL_CORE_ORGANS = 6;

// @route  GET /api/progress
// @desc   Get user's complete learning progress, streak, and badges
const getProgress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: {
        organsExplored: user.organsExplored || [],
        exploredCount: (user.organsExplored || []).length,
        totalOrgans: TOTAL_CORE_ORGANS,
        completionPercentage: Math.min(100, Math.round(((user.organsExplored || []).length / TOTAL_CORE_ORGANS) * 100)),
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        totalQuizzesTaken: user.totalQuizzesTaken || 0,
        totalScore: user.totalScore || 0,
        averageScore: user.totalQuizzesTaken > 0 ? Math.round(user.totalScore / user.totalQuizzesTaken) : 0,
        badges: user.badges || [],
        level: user.level || "college",
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/progress/explore/:organSlug
// @desc   Mark an organ as explored in user's profile and award exploration badges
const exploreOrgan = async (req, res, next) => {
  try {
    const { organSlug } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let newlyExplored = false;
    let newBadges = [];

    if (!user.organsExplored.includes(organSlug)) {
      user.organsExplored.push(organSlug);
      newlyExplored = true;

      // Recalculate completion percentage
      user.completionPercentage = Math.min(100, Math.round((user.organsExplored.length / TOTAL_CORE_ORGANS) * 100));

      const badgeNames = user.badges.map((b) => b.name);

      // Badge: First Exploration
      if (!badgeNames.includes("First Discovery") && user.organsExplored.length >= 1) {
        const b = { name: "First Discovery", icon: "🔭", earnedAt: new Date() };
        user.badges.push(b);
        newBadges.push(b);
      }

      // Badge: Full Human Anatomy Master (all 6 core organs explored)
      if (!badgeNames.includes("Master of Anatomy") && user.organsExplored.length >= TOTAL_CORE_ORGANS) {
        const b = { name: "Master of Anatomy", icon: "👑", earnedAt: new Date() };
        user.badges.push(b);
        newBadges.push(b);
      }

      user.updateStreak();
      await user.save();
    }

    res.json({
      success: true,
      newlyExplored,
      organsExplored: user.organsExplored,
      completionPercentage: user.completionPercentage,
      newBadges,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProgress,
  exploreOrgan,
};
