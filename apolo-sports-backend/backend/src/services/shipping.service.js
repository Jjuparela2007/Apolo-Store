// services/shipping.service.js

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes: á->a, ñ->n, etc.
    .trim();
}

const SHIPPING_BOGOTA = 12000;
const SHIPPING_OTHER = 20000;
const FREE_SHIPPING_THRESHOLD = 300000; // subtotal (sin recargos) por encima del cual el envío es gratis

// Decide la tarifa de envío según ciudad y subtotal:
// - Si el subtotal (sin recargo de pago) supera $300.000, el envío es gratis.
// - Si no, $15.000 para Bogotá, $35.000 para cualquier otra ciudad.
// - Si no hay ciudad todavía (formulario a medio llenar), retorna 0.
function getShippingCost({ city, subtotal }) {
  if (!city) return 0;
  if (subtotal > FREE_SHIPPING_THRESHOLD) return 0;

  const isBogota = normalize(city) === "bogota";
  return isBogota ? SHIPPING_BOGOTA : SHIPPING_OTHER;
}

module.exports = {
  getShippingCost,
  SHIPPING_BOGOTA,
  SHIPPING_OTHER,
  FREE_SHIPPING_THRESHOLD,
};