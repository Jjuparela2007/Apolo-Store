// services/shipping.service.js
const db = require("../config/db");

// Busca primero una tarifa exacta de ciudad; si no existe, la tarifa general
// del departamento (city IS NULL); si tampoco existe, cae a la tarifa '_default'.
// Si no llega ciudad/departamento todavía (formulario a medio llenar), retorna 0.
async function getShippingCost({ city, department }) {
  if (!city || !department) return 0;

  const [[cityRate]] = await db.query(
    `SELECT cost FROM shipping_rates WHERE LOWER(department) = LOWER(?) AND LOWER(city) = LOWER(?) LIMIT 1`,
    [department, city]
  );
  if (cityRate) return Number(cityRate.cost);

  const [[deptRate]] = await db.query(
    `SELECT cost FROM shipping_rates WHERE LOWER(department) = LOWER(?) AND city IS NULL LIMIT 1`,
    [department]
  );
  if (deptRate) return Number(deptRate.cost);

  const [[defaultRate]] = await db.query(
    `SELECT cost FROM shipping_rates WHERE department = '_default' LIMIT 1`
  );
  return defaultRate ? Number(defaultRate.cost) : 0;
}

module.exports = { getShippingCost };
