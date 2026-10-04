const express = require("express");
const router = express.Router();
const { getFlashcards, toggleKnown } = require("../controllers/flashcard.controller");

router.get("/:organSlug", getFlashcards);
router.put("/toggle", toggleKnown);

module.exports = router;
