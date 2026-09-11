const db = require("../config/db");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const wompi = require("../services/wompi.service");
const emailService = require("../services/email.service");
const { asyncHandler } = require("../middleware/error.middleware");
const { requireFields } = require("../middleware/validate.middleware");

// POST /api/payments/checkout-signature  (requiere sesión de cliente)
const getCheckoutSignature = asyncHandler(async (req, res) => {
  requireFields(req.body, ["orderId"]);
  const order = await Order.findById(req.body.orderId);
  if (!order || order.customer_id !== req.customer.id) {
    const err = new Error("Orden no encontrada");
    err.status = 404;
    throw err;
  }

  const amountInCents = Math.round(order.total * 100);
  const signature = wompi.generateIntegritySignature({ reference: order.order_number, amountInCents });

  res.json({
    signature,
    reference: order.order_number,
    amountInCents,
    publicKey: process.env.WOMPI_PUBLIC_KEY,
  });
});

// POST /api/payments/webhook  (llamado por Wompi — no requiere JWT, se autentica con su firma)
const handleWompiWebhook = asyncHandler(async (req, res) => {
  const event = req.body;

  const isValid = wompi.verifyWebhookSignature(event);
  if (!isValid) {
    console.warn("Webhook de Wompi con firma inválida, ignorado.");
    return res.status(200).json({ received: true, valid: false });
  }

  const transaction = event.data.transaction;
  const existing = await Payment.findByProviderTxId(transaction.id);
  if (existing) {
    return res.status(200).json({ received: true, duplicate: true }); // evita procesar el evento dos veces
  }

  const orderNumber = transaction.reference;
  const [[orderRow]] = await db.query(`SELECT id FROM orders WHERE order_number = ?`, [orderNumber]);
  if (!orderRow) {
    console.error(`Webhook de Wompi: orden ${orderNumber} no encontrada`);
    return res.status(200).json({ received: true, orderFound: false });
  }

  await Payment.create({
    orderId: orderRow.id,
    providerTxId: transaction.id,
    paymentMethod: transaction.payment_method_type,
    status: transaction.status.toLowerCase(),
    amount: transaction.amount_in_cents / 100,
    rawResponse: event,
  });

  const newStatus = wompi.mapWompiStatusToOrderStatus(transaction.status);
  const order = await Order.updateStatus(orderRow.id, newStatus);

  if (newStatus === "paid") {
    await emailService.sendOrderConfirmationEmail({ to: order.customer_email, order });
  }

  res.status(200).json({ received: true });
});

module.exports = { getCheckoutSignature, handleWompiWebhook };
