const Organ = require("../models/Organ");
const aiService = require("../services/ai.service");

// @route  POST /api/ai/search
// @desc   Intelligent semantic and fuzzy organ search
const search = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: "Query string is required" });
    }

    const organs = await Organ.find({});
    const organSlug = await aiService.performSearch(query, organs);

    if (organSlug) {
      return res.json({
        success: true,
        organSlug,
      });
    }

    return res.json({
      success: false,
      message: "No matching organ or system found. Try 'brain', 'heart', 'oxygen', or 'filtering blood'.",
    });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/ai/explain
// @desc   Generate depth-tailored educational explanation (school, college, medical)
const explain = async (req, res, next) => {
  try {
    const { topic, level, context } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, message: "Topic is required" });
    }

    const explanation = await aiService.getExplanation({
      topic,
      level: level || req.user?.level || "college",
      context: context || "",
    });

    res.json({
      success: true,
      explanation,
      level: level || req.user?.level || "college",
    });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/ai/chat
// @desc   Interactive conversational biology tutor
const chat = async (req, res, next) => {
  try {
    const { message, history, level } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const reply = await aiService.chatTutor({
      message,
      history: history || [],
      level: level || req.user?.level || "college",
    });

    res.json({
      success: true,
      reply,
    });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/ai/flashcards
// @desc   Auto-generate flashcards for an organ or topic
const generateFlashcards = async (req, res, next) => {
  try {
    const { organSlug, level } = req.body;
    const cards = await aiService.generateFlashcards(
      organSlug || "general",
      level || req.user?.level || "college"
    );

    res.json({
      success: true,
      cards,
    });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/ai/notes
// @desc   Auto-generate study notes / revision sheet for an organ
const generateNotes = async (req, res, next) => {
  try {
    const { organSlug, level } = req.body;
    const notes = await aiService.generateNotes(
      organSlug || "general",
      level || req.user?.level || "college"
    );

    res.json({
      success: true,
      notes,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  search,
  explain,
  chat,
  generateFlashcards,
  generateNotes,
};
