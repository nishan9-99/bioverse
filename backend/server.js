const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set. Copy .env.example to .env and set it.");
  process.exit(1);
}

const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/error.middleware");

// ── Connect Database & Automated Seed ─────────────────────────
const Organ = require("./models/Organ");
const { seedDB } = require("./seed");

connectDB().then(async () => {
  try {
    const count = await Organ.countDocuments();
    if (count === 0) {
      console.log("🌱 Fresh database detected. Running automated initial seed...");
      await seedDB(false);
    }
  } catch (err) {
    console.warn("Auto-seed note:", err.message);
  }
});

const app = express();

// ── Security Middleware ───────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

// ── Body Parser ───────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Logger (dev only) ─────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Health Check ──────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "BioVerse API is running 🧬",
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",         require("./routes/auth.routes"));
app.use("/api/organs",       require("./routes/organ.routes"));
app.use("/api/diseases",     require("./routes/disease.routes"));
app.use("/api/quiz",         require("./routes/quiz.routes"));
app.use("/api/progress",     require("./routes/progress.routes"));
app.use("/api/ai",           require("./routes/ai.routes"));
app.use("/api/flashcards",   require("./routes/flashcard.routes"));
app.use("/api/notes",        require("./routes/note.routes"));
app.use("/api/achievements", require("./routes/achievement.routes"));

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 BioVerse Server running on port ${PORT}`);
  console.log(`🧬 API Health:    http://localhost:${PORT}/api/health`);
});
