// services/shipping.service.js
const db = require("../config/db");

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes: á->a, ñ->n, etc.
    .trim();
}

// Decide la tarifa SOLO por la ciudad (normalizada, sin importar tildes ni
// mayúsculas) — así "Bogotá", "bogota", "BOGOTÁ" o "bogotá" siempre matchean.
// Si no hay ciudad todavía (formulario a medio llenar), retorna 0.
async function getShippingCost({ city }) {
  if (!city) return 0;

  const isBogota = normalize(city) === "bogota";
  const targetDepartment = isBogota ? "Bogotá D.C." : "_default";

  const [[rate]] = await db.query(
    `SELECT cost FROM shipping_rates WHERE department = ? LIMIT 1`,
    [targetDepartment]
  );
  if (rate) return Number(rate.cost);

  // Respaldo por si borraste la fila _default por accidente
  return 0;
}

module.exports = { getShippingCost };