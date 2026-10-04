const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { submitQuiz, getQuizHistory } = require("../controllers/quiz.controller");

// Quiz endpoints
router.post("/submit", protect, submitQuiz);
router.get("/history", protect, getQuizHistory);

module.exports = router;
