const express = require("express");
const router = express.Router();
const { createOrder, getOrder, listMyOrders } = require("../controllers/order.controller");
const { requireCustomerAuth } = require("../middleware/auth.middleware");

router.use(requireCustomerAuth);

router.post("/", createOrder);
router.get("/", listMyOrders);
router.get("/:id", getOrder);
router.post("/orders/quote", authenticateCustomer, quoteOrder);

module.exports = router;
