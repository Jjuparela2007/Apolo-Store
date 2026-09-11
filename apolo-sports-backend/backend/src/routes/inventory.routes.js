const express = require("express");
const router = express.Router();
const { adjustStock, lowStock } = require("../controllers/inventory.controller");
const { requireAdminAuth } = require("../middleware/auth.middleware");

router.use(requireAdminAuth);

router.post("/adjust", adjustStock);
router.get("/low-stock", lowStock);

module.exports = router;
