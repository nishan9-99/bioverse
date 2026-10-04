const Disease = require("../models/Disease");

// @route  GET /api/diseases
// @desc   Get all diseases, optionally filtered by category or affected organ
const getDiseases = async (req, res, next) => {
  try {
    const { category, organ } = req.query;
    const filter = {};

    if (category) {
      filter.category = new RegExp(category, "i");
    }
    if (organ) {
      filter.affectedOrgans = organ.toLowerCase();
    }

    const diseases = await Disease.find(filter).sort({ name: 1 });
    res.json({
      success: true,
      count: diseases.length,
      data: diseases,
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/diseases/:slug
// @desc   Get single disease by slug
const getDiseaseBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const disease = await Disease.findOne({ slug });

    if (!disease) {
      return res.status(404).json({
        success: false,
        message: `Disease with slug '${slug}' not found.`,
      });
    }

    res.json({
      success: true,
      data: disease,
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/diseases/organ/:organSlug
// @desc   Get all diseases affecting a specific organ
const getDiseasesByOrgan = async (req, res, next) => {
  try {
    const { organSlug } = req.params;
    const diseases = await Disease.find({
      affectedOrgans: organSlug.toLowerCase(),
    });

    res.json({
      success: true,
      count: diseases.length,
      data: diseases,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDiseases,
  getDiseaseBySlug,
  getDiseasesByOrgan,
};
