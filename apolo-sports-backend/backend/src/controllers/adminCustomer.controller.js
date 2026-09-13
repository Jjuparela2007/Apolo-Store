const bcrypt = require("bcryptjs");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const { asyncHandler } = require("../middleware/error.middleware");
const { requireFields, validateEmail, validatePasswordStrength } = require("../middleware/validate.middleware");

// GET /api/admin/customers?search=&page=
const listCustomers = asyncHandler(async (req, res) => {
  const { search, page } = req.query;
  const result = await Customer.findAll({ search, page });
  res.json(result);
});

// GET /api/admin/customers/:id  — perfil + historial de pedidos
const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    const err = new Error("Cliente no encontrado");
    err.status = 404;
    throw err;
  }
  const orders = await Order.findByCustomer(req.params.id, { limit: 50 });
  res.json({ customer, orders });
});

// POST /api/admin/customers  — crear cliente manualmente desde el panel
const createCustomer = asyncHandler(async (req, res) => {
  const { email: rawEmail, password, fullName, phone } = req.body;
  requireFields(req.body, ["email", "password", "fullName"]);
  validateEmail(rawEmail);
  validatePasswordStrength(password);

  const normalizedEmail = rawEmail.trim().toLowerCase();
  const existing = await Customer.findByEmail(normalizedEmail);
  if (existing) {
    const err = new Error("Ya existe un cliente con ese correo.");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const customer = await Customer.create({ email: normalizedEmail, passwordHash, fullName, phone });
  res.status(201).json({ customer });
});

module.exports = { listCustomers, getCustomer, createCustomer };
