const express = require("express");
const router = express.Router();
const { createOrder, getOrder, listMyOrders, quoteOrder } = require("../controllers/order.controller");
const { requireCustomerAuth } = require("../middleware/auth.middleware");
const { requirePhone } = require("../middleware/requirePhone.middleware");

router.use(requireCustomerAuth);
router.post("/quote", quoteOrder); // cotizar no requiere perfil completo, solo crear la orden
router.post("/", requirePhone, createOrder);
router.get("/", listMyOrders);
router.get("/:id", getOrder);

module.exports = router;