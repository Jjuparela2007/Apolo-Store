// services/quote.service.js
//
// Separa dos versiones del mismo pedido:
//  - calculateOrderBreakdown: los montos REALES (envío real + comisión de
//    Wompi por separado). Esto es lo que se guarda en la orden, para que tus
//    reportes y el panel admin reflejen la plata real.
//  - toCustomerQuote: la versión que ve el cliente en el checkout, donde la
//    comisión de Wompi (cuando aplica) se esconde dentro del envío — nunca
//    aparece como línea aparte.
//
// Si el subtotal supera el umbral de envío gratis, el pedido queda SIN envío
// Y SIN comisión de Wompi: el negocio absorbe la comisión y el cliente paga
// exactamente el subtotal.

const { getShippingCost, FREE_SHIPPING_THRESHOLD } = require("./shipping.service");
const { calculateTotalWithSurcharge } = require("./pricing.service");

function calculateOrderBreakdown({ subtotal, shippingCity }) {
  if (subtotal > FREE_SHIPPING_THRESHOLD) {
    return { subtotal, shippingCost: 0, paymentSurcharge: 0, total: subtotal };
  }

  const shippingCost = getShippingCost({ city: shippingCity, subtotal });
  const netAmount = subtotal + shippingCost; // lo que quieres recibir neto, sin recargo
  const { surcharge: paymentSurcharge, total } = calculateTotalWithSurcharge(netAmount);
  return { subtotal, shippingCost, paymentSurcharge, total };
}

function toCustomerQuote(breakdown) {
  return {
    subtotal: breakdown.subtotal,
    shippingCost: breakdown.shippingCost + breakdown.paymentSurcharge,
    total: breakdown.total,
  };
}

module.exports = { calculateOrderBreakdown, toCustomerQuote };