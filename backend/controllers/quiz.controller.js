const QuizResult = require("../models/QuizResult");
const User = require("../models/User");

// @route  POST /api/quiz/submit
// @desc   Submit quiz answers, persist result, update streak & award achievement badges
const submitQuiz = async (req, res, next) => {
  try {
    const { organ, quizType = "mcq", totalQuestions, correctAnswers, score, timeTaken = 0, answers = [] } = req.body;
    const userId = req.user?._id;

    let quizResult = null;
    let newBadges = [];

    if (userId) {
      quizResult = await QuizResult.create({
        user: userId,
        organ,
        quizType,
        totalQuestions,
        correctAnswers,
        score,
        timeTaken,
        answers,
      });

      const user = await User.findById(userId);
      if (user) {
        user.totalQuizzesTaken += 1;
        user.totalScore += score;
        user.updateStreak();

        // Award Badges
        const currentBadgeNames = user.badges.map((b) => b.name);

        // 1. First Quiz
        if (!currentBadgeNames.includes("Anatomy Novice") && user.totalQuizzesTaken >= 1) {
          const b = { name: "Anatomy Novice", icon: "🌱", earnedAt: new Date() };
          user.badges.push(b);
          newBadges.push(b);
        }

        // 2. Perfect Score
        if (!currentBadgeNames.includes("Flawless Knowledge") && score === 100) {
          const b = { name: "Flawless Knowledge", icon: "💎", earnedAt: new Date() };
          user.badges.push(b);
          newBadges.push(b);
        }

        // 3. Quiz Veteran (5 quizzes)
        if (!currentBadgeNames.includes("Biology Scholar") && user.totalQuizzesTaken >= 5) {
          const b = { name: "Biology Scholar", icon: "🎓", earnedAt: new Date() };
          user.badges.push(b);
          newBadges.push(b);
        }

        // 4. Organ Mastery Badge
        const organBadgeName = `${organ.charAt(0).toUpperCase() + organ.slice(1).replace(/-/g, " ")} Specialist`;
        if (!currentBadgeNames.includes(organBadgeName) && score >= 80) {
          const b = { name: organBadgeName, icon: "🏅", earnedAt: new Date() };
          user.badges.push(b);
          newBadges.push(b);
        }

        await user.save();
      }
    }

    res.json({
      success: true,
      message: "Quiz submitted successfully!",
      score,
      correctAnswers,
      totalQuestions,
      newBadges,
      resultId: quizResult?._id,
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/quiz/history
// @desc   Get user's past quiz history
const getQuizHistory = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const history = await QuizResult.find({ user: userId }).sort({ createdAt: -1 }).limit(20);
    res.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitQuiz,
  getQuizHistory,
};
