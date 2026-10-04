const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { getProgress, exploreOrgan } = require("../controllers/progress.controller");

// Progress endpoints
router.get("/", protect, getProgress);
router.post("/explore/:organSlug", protect, exploreOrgan);

module.exports = router;
