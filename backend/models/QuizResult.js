const mongoose = require("mongoose");

const QuizResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organ: { type: String, required: true },
    quizType: {
      type: String,
      enum: ["mcq", "fillblank", "match", "label"],
      required: true,
    },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    score: { type: Number, required: true }, // percentage
    timeTaken: { type: Number, default: 0 }, // seconds
    answers: [
      {
        question: String,
        userAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizResult", QuizResultSchema);
