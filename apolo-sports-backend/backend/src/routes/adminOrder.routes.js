const express = require("express");
const router = express.Router();
const { listOrders, getOrderAdmin, updateOrderStatus, createManualSale } = require("../controllers/order.controller");
const { requireAdminAuth } = require("../middleware/auth.middleware");

router.use(requireAdminAuth);

// Va ANTES de "/:id" a propósito — si no, Express probaría a interpretar "manual"
// como si fuera un :id.
router.post("/manual", createManualSale);

router.get("/", listOrders);
router.get("/:id", getOrderAdmin);
router.put("/:id/status", updateOrderStatus);

module.exports = router;