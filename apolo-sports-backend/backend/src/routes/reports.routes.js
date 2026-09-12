const express = require("express");
const router = express.Router();
const { getSalesReport, getTopProductsReport, getSummaryReport } = require("../controllers/reports.controller");
const { requireAdminAuth } = require("../middleware/auth.middleware");

router.use(requireAdminAuth);

router.get("/sales", getSalesReport);
router.get("/top-products", getTopProductsReport);
router.get("/summary", getSummaryReport);

module.exports = router;