const Organ = require("../models/Organ");
const Disease = require("../models/Disease");

// @route  GET /api/organs
// @desc   Get all organs with summary info
const getOrgans = async (req, res, next) => {
  try {
    const organs = await Organ.find({}).select("-__v");
    res.json({
      success: true,
      count: organs.length,
      data: organs,
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/organs/:slug
// @desc   Get single organ by slug, including associated diseases
const getOrganBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const organ = await Organ.findOne({ slug });

    if (!organ) {
      return res.status(404).json({
        success: false,
        message: `Organ with slug '${slug}' not found.`,
      });
    }

    // Also look up associated diseases for this organ from Disease collection
    const associatedDiseases = await Disease.find({
      $or: [{ affectedOrgans: slug }, { affectedOrgans: organ.name.toLowerCase() }],
    }).select("name slug category shortDesc");

    const organObj = organ.toObject();
    organObj.clinicalDiseases = associatedDiseases;

    res.json({
      success: true,
      data: organObj,
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/organs/system/:system
// @desc   Get organs belonging to a specific body system
const getOrgansBySystem = async (req, res, next) => {
  try {
    const { system } = req.params;
    const organs = await Organ.find({
      system: new RegExp(system, "i"),
    });

    res.json({
      success: true,
      count: organs.length,
      data: organs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOrgans,
  getOrganBySlug,
  getOrgansBySystem,
};
