const express = require("express");
const router = express.Router();
const { listCustomers, getCustomer, createCustomer } = require("../controllers/adminCustomer.controller");
const { requireAdminAuth } = require("../middleware/auth.middleware");

// Todas las rutas de este archivo requieren sesión de administrador
router.use(requireAdminAuth);

router.get("/", listCustomers);
router.get("/:id", getCustomer);
router.post("/", createCustomer);

module.exports = router;
