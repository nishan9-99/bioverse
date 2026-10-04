const express = require("express");
const router = express.Router();
const { aiLimiter } = require("../middleware/error.middleware");
const {
  search,
  explain,
  chat,
  generateFlashcards,
  generateNotes,
} = require("../controllers/ai.controller");

// AI endpoints
router.post("/search", search);
router.post("/explain", aiLimiter, explain);
router.post("/chat", aiLimiter, chat);
router.post("/flashcards", aiLimiter, generateFlashcards);
router.post("/notes", aiLimiter, generateNotes);

module.exports = router;
