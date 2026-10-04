const mongoose = require("mongoose");

const organPartSchema = new mongoose.Schema({
  name: { type: String, required: true },
  biologicalTerm: { type: String },
  description: { type: String },
  location: { type: String, required: true },
  functions: [{ type: String }],
  additionalFacts: { type: String },
  color: { type: String, default: "#06b6d4" },
});

const organSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    system: { type: String, required: true },
    location: { type: String },
    weight: { type: String },
    color: { type: String },
    shortDesc: { type: String },
    overview: { type: String },
    description: { type: String },
    modelUrl: { type: String },
    modelFile: { type: String },
    thumbnail: { type: String },
    parts: [organPartSchema],
    diseases: [{ type: String }],
    funFacts: [{ type: String }],
    biomimicry: {
      inspiration: String,
      explanation: String,
      module: String,
    },
    relatedOrgans: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organ", organSchema);
