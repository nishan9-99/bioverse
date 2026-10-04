const express = require("express");
const router = express.Router();
const {
  getDiseases,
  getDiseaseBySlug,
  getDiseasesByOrgan,
} = require("../controllers/disease.controller");

// Disease routes
router.get("/", getDiseases);
router.get("/organ/:organSlug", getDiseasesByOrgan);
router.get("/:slug", getDiseaseBySlug);

module.exports = router;
