const { Note } = require("../models/Extras");
const aiService = require("../services/ai.service");

// @route  GET /api/notes/:organSlug
// @desc   Get study notes for an organ
const getNotes = async (req, res, next) => {
  try {
    const { organSlug } = req.params;
    const userId = req.user?._id;
    const level = req.query.level || req.user?.level || "college";

    let note = null;
    if (userId) {
      note = await Note.findOne({ user: userId, organ: organSlug, level });
    }

    if (!note) {
      const generatedContent = await aiService.generateNotes(organSlug, level);
      if (userId) {
        note = await Note.create({
          user: userId,
          organ: organSlug,
          level,
          content: generatedContent,
          type: "summary",
        });
      } else {
        return res.json({
          success: true,
          data: { organ: organSlug, level, content: generatedContent },
        });
      }
    }

    res.json({
      success: true,
      data: note,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotes,
};
