const mongoose = require("mongoose");

// ── Progress Model ────────────────────────────────────────────
const ProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organ: { type: String, required: true },
    partsViewed: [String],
    timeSpent: { type: Number, default: 0 }, // seconds
    aiExplanationUsed: { type: Boolean, default: false },
    quizAttempted: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Flashcard Model ───────────────────────────────────────────
const FlashcardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organ: { type: String, required: true },
    cards: [
      {
        front: String, // question / term
        back: String,  // answer / definition
        known: { type: Boolean, default: false },
      },
    ],
    level: { type: String, enum: ["school", "college", "medical"], default: "college" },
  },
  { timestamps: true }
);

// ── SearchHistory Model ───────────────────────────────────────
const SearchHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    query: { type: String, required: true },
    resultType: { type: String, enum: ["organ", "disease", "term"], default: "organ" },
    resultSlug: String,
  },
  { timestamps: true }
);

// ── Note Model ────────────────────────────────────────────────
const NoteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organ: { type: String, required: true },
    level: { type: String, enum: ["school", "college", "medical"], default: "college" },
    content: { type: String, required: true },
    type: { type: String, enum: ["summary", "revision", "flashcards"], default: "summary" },
  },
  { timestamps: true }
);

module.exports = {
  Progress: mongoose.model("Progress", ProgressSchema),
  Flashcard: mongoose.model("Flashcard", FlashcardSchema),
  SearchHistory: mongoose.model("SearchHistory", SearchHistorySchema),
  Note: mongoose.model("Note", NoteSchema),
};
