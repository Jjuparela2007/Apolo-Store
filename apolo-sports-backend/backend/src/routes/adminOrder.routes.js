const express = require("express");
const router = express.Router();
const { listOrders, getOrderAdmin } = require("../controllers/order.controller");
const { requireAdminAuth } = require("../middleware/auth.middleware");

router.use(requireAdminAuth);

router.get("/", listOrders);
router.get("/:id", getOrderAdmin);

module.exports = router;
