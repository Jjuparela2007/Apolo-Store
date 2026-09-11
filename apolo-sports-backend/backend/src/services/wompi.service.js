const crypto = require("crypto");

function generateIntegritySignature({ reference, amountInCents, currency = "COP" }) {
  const secret = process.env.WOMPI_INTEGRITY_SECRET;
  const chain = `${reference}${amountInCents}${currency}${secret}`;
  return crypto.createHash("sha256").update(chain).digest("hex");
}

// Verifica que el evento de webhook venga realmente de Wompi antes de confiar en él.
function verifyWebhookSignature(event) {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!event || !event.signature || !event.data) return false;

  const { properties, checksum } = event.signature;
  const timestamp = event.timestamp;

  const values = properties.map((path) => path.split(".").reduce((obj, key) => obj?.[key], event.data));
  const chain = `${values.join("")}${timestamp}${secret}`;
  const expectedChecksum = crypto.createHash("sha256").update(chain).digest("hex").toUpperCase();

  return expectedChecksum === checksum.toUpperCase();
}

function mapWompiStatusToOrderStatus(wompiStatus) {
  const map = {
    APPROVED: "paid",
    DECLINED: "cancelled",
    VOIDED: "cancelled",
    ERROR: "cancelled",
    PENDING: "pending_payment",
  };
  return map[wompiStatus] || "pending_payment";
}

module.exports = { generateIntegritySignature, verifyWebhookSignature, mapWompiStatusToOrderStatus };
