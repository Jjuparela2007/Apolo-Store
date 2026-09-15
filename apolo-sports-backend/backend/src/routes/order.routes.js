const express = require("express");
const router = express.Router();
const { createOrder, getOrder, listMyOrders, quoteOrder } = require("../controllers/order.controller");
const { requireCustomerAuth } = require("../middleware/auth.middleware");

router.use(requireCustomerAuth);
router.post("/quote", quoteOrder);
router.post("/", createOrder);
router.get("/", listMyOrders);
router.get("/:id", getOrder);

module.exports = router;