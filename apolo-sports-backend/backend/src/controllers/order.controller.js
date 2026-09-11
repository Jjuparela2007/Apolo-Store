const Order = require("../models/Order");
const { asyncHandler } = require("../middleware/error.middleware");
const { requireFields } = require("../middleware/validate.middleware");

// POST /api/orders  (checkout — requiere sesión de cliente; toma el carrito actual)
const createOrder = asyncHandler(async (req, res) => {
  requireFields(req.body, ["shippingAddressLine", "shippingCity", "shippingDepartment"]);
  const { shippingAddressLine, shippingCity, shippingDepartment, shippingCost } = req.body;

  const order = await Order.createFromCart({
    customerId: req.customer.id,
    customerEmail: req.customer.email,
    shippingAddressLine, shippingCity, shippingDepartment, shippingCost,
  });

  res.status(201).json({ order });
});

// GET /api/orders/:id  (el cliente consulta el estado de su propia orden)
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || order.customer_id !== req.customer.id) {
    const err = new Error("Orden no encontrada");
    err.status = 404;
    throw err;
  }
  res.json({ order });
});

// GET /api/orders  (historial de pedidos del cliente autenticado)
const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findByCustomer(req.customer.id, { page: req.query.page });
  res.json({ orders });
});

// GET /api/admin/orders  (protegido — panel de administración, todas las órdenes)
const listOrders = asyncHandler(async (req, res) => {
  const { status, page } = req.query;
  const orders = await Order.findAll({ status, page });
  res.json({ orders });
});

// GET /api/admin/orders/:id  (protegido)
const getOrderAdmin = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    const err = new Error("Orden no encontrada");
    err.status = 404;
    throw err;
  }
  res.json({ order });
});

module.exports = { createOrder, getOrder, listMyOrders, listOrders, getOrderAdmin };
