const Wishlist = require("../models/Wishlist");
const { asyncHandler } = require("../middleware/error.middleware");
const { requireFields } = require("../middleware/validate.middleware");

// GET /api/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const items = await Wishlist.getForCustomer(req.customer.id);
  res.json({ items });
});

// POST /api/wishlist/items  { productId }
const addItem = asyncHandler(async (req, res) => {
  requireFields(req.body, ["productId"]);
  const items = await Wishlist.addItem(req.customer.id, req.body.productId);
  res.status(201).json({ items });
});

// DELETE /api/wishlist/items/:productId
const removeItem = asyncHandler(async (req, res) => {
  const items = await Wishlist.removeItem(req.customer.id, req.params.productId);
  res.json({ items });
});

module.exports = { getWishlist, addItem, removeItem };
