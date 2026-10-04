const express = require("express");
const router = express.Router();
const { getNotes } = require("../controllers/note.controller");

router.get("/:organSlug", getNotes);

module.exports = router;
