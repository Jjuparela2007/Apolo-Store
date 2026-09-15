// services/pricing.service.js
//
// Wompi cobra por cada transacción aprobada: $700 COP fijos + 2.65% + IVA (19%)
// sobre esa comisión. Como el fijo domina en compras pequeñas, no basta un
// porcentaje simple: hay que calcular el "gross-up" para que, después de que
// Wompi descuente su comisión, te llegue exactamente el valor neto deseado.
//
// IMPORTANTE: confirma estos valores contra tu tarifa real en el dashboard/
// contrato de Wompi — pueden variar según tu plan o volumen.
const WOMPI_FIXED_FEE = 700; // pesos fijos por transacción aprobada
const WOMPI_PERCENT_FEE = 0.0265; // 2.65%
const IVA_ON_FEE = 0.19; // IVA sobre la comisión de Wompi (no sobre tu venta)

/**
 * Dado el monto neto que quieres recibir (subtotal + envío, sin recargo),
 * calcula cuánto debe pagar el cliente para que, tras el descuento de
 * Wompi, te llegue exactamente ese neto.
 */
function calculateTotalWithSurcharge(netAmountDesired) {
  const fixedWithTax = WOMPI_FIXED_FEE * (1 + IVA_ON_FEE); // 833
  const percentWithTax = WOMPI_PERCENT_FEE * (1 + IVA_ON_FEE); // 0.031535

  const rawTotal = (netAmountDesired + fixedWithTax) / (1 - percentWithTax);
  const total = Math.round(rawTotal);
  const surcharge = total - netAmountDesired;

  return { net: netAmountDesired, surcharge, total };
}

module.exports = { calculateTotalWithSurcharge, WOMPI_FIXED_FEE, WOMPI_PERCENT_FEE, IVA_ON_FEE };
