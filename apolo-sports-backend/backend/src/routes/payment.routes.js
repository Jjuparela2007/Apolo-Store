const express = require("express");
const router = express.Router();
const { getCheckoutSignature, handleWompiWebhook } = require("../controllers/payment.controller");
const { requireCustomerAuth } = require("../middleware/auth.middleware");

router.post("/checkout-signature", requireCustomerAuth, getCheckoutSignature);

// Wompi llama esta URL directamente (configurada en su dashboard) — se autentica con la
// firma del evento, no con JWT (ver wompi.service.js → verifyWebhookSignature)
router.post("/webhook", handleWompiWebhook);

module.exports = router;
