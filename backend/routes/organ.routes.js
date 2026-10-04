const express = require("express");
const router = express.Router();
const {
  getOrgans,
  getOrganBySlug,
  getOrgansBySystem,
} = require("../controllers/organ.controller");

// Public endpoints for viewing organ anatomy and systems
router.get("/", getOrgans);
router.get("/system/:system", getOrgansBySystem);
router.get("/:slug", getOrganBySlug);

module.exports = router;
