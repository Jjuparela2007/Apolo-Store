const Category = require("../models/Category");
const { asyncHandler } = require("../middleware/error.middleware");
const { requireFields } = require("../middleware/validate.middleware");

const listCategories = asyncHandler(async (req, res) => {
  res.json({ categories: await Category.findAll() });
});

const createCategory = asyncHandler(async (req, res) => {
  requireFields(req.body, ["name", "slug"]);
  const category = await Category.create(req.body);
  res.status(201).json({ category });
});

module.exports = { listCategories, createCategory };
