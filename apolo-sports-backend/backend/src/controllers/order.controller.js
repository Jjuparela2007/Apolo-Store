const Order = require("../models/Order");
const emailService = require("../services/email.service");
const { asyncHandler } = require("../middleware/error.middleware");
const { requireFields } = require("../middleware/validate.middleware");

const VALID_STATUSES = [
  "pending_payment", "paid", "processing", "shipped", "delivered", "cancelled", "refunded",
];

// POST /api/orders/quote  (requiere sesión de cliente — previsualiza el total con recargo, sin crear la orden)
const quoteOrder = asyncHandler(async (req, res) => {
  const { shippingCost } = req.body;
  const quote = await Order.quote({ customerId: req.customer.id, shippingCost: shippingCost || 0 });
  res.json({ quote });
});

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

// PUT /api/admin/orders/:id/status  (protegido) — body: { status }
const updateOrderStatus = asyncHandler(async (req, res) => {
  requireFields(req.body, ["status"]);
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    const err = new Error(`Estado inválido. Debe ser uno de: ${VALID_STATUSES.join(", ")}`);
    err.status = 400;
    throw err;
  }

  const existing = await Order.findById(req.params.id);
  if (!existing) {
    const err = new Error("Orden no encontrada");
    err.status = 404;
    throw err;
  }

  const order = await Order.updateStatus(req.params.id, status);

  // Avisa al cliente por correo en los cambios que le importan seguir (no en cada estado interno)
  if (["processing", "shipped", "delivered", "cancelled", "refunded"].includes(status)) {
    emailService
      .sendOrderStatusUpdateEmail({ to: order.customer_email, order, status })
      .catch((err) => console.warn("No se pudo enviar el correo de actualización de pedido:", err.message));
  }

  res.json({ order });
});

module.exports = { createOrder, getOrder, listMyOrders, listOrders, getOrderAdmin, updateOrderStatus, quoteOrder };