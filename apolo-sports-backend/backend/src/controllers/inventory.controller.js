const ProductVariant = require("../models/ProductVariant");
const { asyncHandler } = require("../middleware/error.middleware");
const { requireFields } = require("../middleware/validate.middleware");

// POST /api/admin/inventory/adjust  (protegido)
const adjustStock = asyncHandler(async (req, res) => {
  requireFields(req.body, ["variantId", "changeQty", "reason"]);
  const { variantId, changeQty, reason } = req.body;
  const newStock = await ProductVariant.adjustStock({ variantId, changeQty, reason });
  res.json({ variantId, newStock });
});

// GET /api/admin/inventory/low-stock
const lowStock = asyncHandler(async (req, res) => {
  const variants = await ProductVariant.findLowStock(req.query.productId);
  res.json({ variants });
});

module.exports = { adjustStock, lowStock };
