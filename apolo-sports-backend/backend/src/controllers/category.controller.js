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

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.update(req.params.id, req.body);
  res.json({ category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await Category.remove(req.params.id);
  res.status(204).send();
});

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
