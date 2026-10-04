const { Flashcard } = require("../models/Extras");
const aiService = require("../services/ai.service");

// @route  GET /api/flashcards/:organSlug
// @desc   Get flashcards for an organ (from DB or auto-generated)
const getFlashcards = async (req, res, next) => {
  try {
    const { organSlug } = req.params;
    const userId = req.user?._id;
    const level = req.query.level || req.user?.level || "college";

    let deck = null;
    if (userId) {
      deck = await Flashcard.findOne({ user: userId, organ: organSlug, level });
    }

    if (!deck) {
      // Auto-generate high-yield flashcards
      const generatedCards = await aiService.generateFlashcards(organSlug, level);
      if (userId) {
        deck = await Flashcard.create({
          user: userId,
          organ: organSlug,
          level,
          cards: generatedCards,
        });
      } else {
        return res.json({
          success: true,
          data: { organ: organSlug, level, cards: generatedCards },
        });
      }
    }

    res.json({
      success: true,
      data: deck,
    });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/flashcards/toggle
// @desc   Toggle known status of a specific flashcard
const toggleKnown = async (req, res, next) => {
  try {
    const { deckId, cardIndex } = req.body;
    const deck = await Flashcard.findById(deckId);

    if (!deck) {
      return res.status(404).json({ success: false, message: "Deck not found" });
    }

    if (deck.cards[cardIndex]) {
      deck.cards[cardIndex].known = !deck.cards[cardIndex].known;
      await deck.save();
    }

    res.json({
      success: true,
      data: deck,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFlashcards,
  toggleKnown,
};
