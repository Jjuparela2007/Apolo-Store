const Report = require("../models/Report");
const { asyncHandler } = require("../middleware/error.middleware");

// GET /api/admin/reports/sales?groupBy=day|month&from=&to=
const getSalesReport = asyncHandler(async (req, res) => {
  const { groupBy, from, to } = req.query;
  const sales = await Report.getSalesOverTime({ groupBy, from, to });
  res.json({ sales });
});

// GET /api/admin/reports/top-products?limit=10&from=&to=
const getTopProductsReport = asyncHandler(async (req, res) => {
  const { limit, from, to } = req.query;
  const products = await Report.getTopProducts({ limit, from, to });
  res.json({ products });
});

// GET /api/admin/reports/summary?from=&to=
const getSummaryReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const summary = await Report.getSummary({ from, to });
  res.json({ summary });
});

module.exports = { getSalesReport, getTopProductsReport, getSummaryReport };