const Order = require("../models/Order");
const emailService = require("../services/email.service");
const { asyncHandler } = require("../middleware/error.middleware");
const { requireFields } = require("../middleware/validate.middleware");

const VALID_STATUSES = [
  "pending_payment", "paid", "processing", "shipped", "delivered", "cancelled", "refunded",
];
const VALID_PAYMENT_METHODS = ["efectivo", "tarjeta", "transferencia"];

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
  const { status, page, channel } = req.query;
  const orders = await Order.findAll({ status, channel, page });
  res.json({ orders });
});

// POST /api/admin/orders/manual  (protegido) — registrar una venta del local físico.
// body: { items: [{ variantId, quantity }], paymentMethod, walkInCustomerName?, walkInCustomerPhone? }
const createManualSale = asyncHandler(async (req, res) => {
  requireFields(req.body, ["items", "paymentMethod"]);
  const { items, paymentMethod, walkInCustomerName, walkInCustomerPhone } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error("Agrega al menos un producto a la venta");
    err.status = 400;
    throw err;
  }
  if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    const err = new Error(`Método de pago inválido. Debe ser uno de: ${VALID_PAYMENT_METHODS.join(", ")}`);
    err.status = 400;
    throw err;
  }

  const order = await Order.createManualSale({
    items, paymentMethod, walkInCustomerName, walkInCustomerPhone, adminId: req.admin.id,
  });

  res.status(201).json({ order });
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

  // Avisa al cliente por correo en los cambios que le importan seguir (no en cada estado
  // interno) — solo si hay correo; las ventas de mostrador pueden no tener uno.
  if (order.customer_email && ["processing", "shipped", "delivered", "cancelled", "refunded"].includes(status)) {
    emailService
      .sendOrderStatusUpdateEmail({ to: order.customer_email, order, status })
      .catch((err) => console.warn("No se pudo enviar el correo de actualización de pedido:", err.message));
  }

  res.json({ order });
});

module.exports = { createOrder, getOrder, listMyOrders, listOrders, getOrderAdmin, updateOrderStatus, createManualSale };