const mongoose = require("mongoose");

const diseaseSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    affectedOrgans: [{ type: String, required: true }],
    category: { type: String, required: true },
    shortDesc: { type: String, required: true },
    symptoms: [{ type: String }],
    causes: [{ type: String }],
    treatment: [{ type: String }],
    stages: [{ type: String }],
    funFact: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Disease", diseaseSchema);
