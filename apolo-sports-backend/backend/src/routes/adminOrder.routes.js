const express = require("express");
const router = express.Router();
const { listOrders, getOrderAdmin, updateOrderStatus } = require("../controllers/order.controller");
const { requireAdminAuth } = require("../middleware/auth.middleware");

router.use(requireAdminAuth);

router.get("/", listOrders);
router.get("/:id", getOrderAdmin);
router.put("/:id/status", updateOrderStatus);

module.exports = router;