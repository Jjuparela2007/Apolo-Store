const db = require("../config/db");

// Estados que cuentan como "venta real" para reportes — se excluye pending_payment
// (todavía no pagó) y cancelled (nunca se concretó).
const COUNTED_STATUSES = ["paid", "processing", "shipped", "delivered"];

const Report = {
  // Ventas agrupadas por día o por mes, dentro de un rango de fechas opcional.
  async getSalesOverTime({ groupBy = "day", from, to } = {}) {
    const dateFormat = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";
    const conditions = [`status IN (${COUNTED_STATUSES.map(() => "?").join(",")})`];
    const params = [...COUNTED_STATUSES];

    if (from) { conditions.push("created_at >= ?"); params.push(from); }
    if (to) { conditions.push("created_at <= ?"); params.push(to); }

    const [rows] = await db.query(
      `SELECT DATE_FORMAT(created_at, ?) AS period,
              COUNT(*) AS order_count,
              SUM(total) AS revenue
       FROM orders
       WHERE ${conditions.join(" AND ")}
       GROUP BY period
       ORDER BY period ASC`,
      [dateFormat, ...params]
    );
    return rows;
  },

  // Productos más vendidos por cantidad, dentro de un rango de fechas opcional.
  async getTopProducts({ limit = 10, from, to } = {}) {
    const conditions = [`o.status IN (${COUNTED_STATUSES.map(() => "?").join(",")})`];
    const params = [...COUNTED_STATUSES];

    if (from) { conditions.push("o.created_at >= ?"); params.push(from); }
    if (to) { conditions.push("o.created_at <= ?"); params.push(to); }

    const safeLimit = Math.min(Number(limit) || 10, 50);

    const [rows] = await db.query(
      `SELECT oi.product_name,
              SUM(oi.quantity) AS units_sold,
              SUM(oi.unit_price * oi.quantity) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE ${conditions.join(" AND ")}
       GROUP BY oi.product_name
       ORDER BY units_sold DESC
       LIMIT ?`,
      [...params, safeLimit]
    );
    return rows;
  },

  // Totales generales para las tarjetas de resumen del reporte.
  async getSummary({ from, to } = {}) {
    const conditions = [`status IN (${COUNTED_STATUSES.map(() => "?").join(",")})`];
    const params = [...COUNTED_STATUSES];

    if (from) { conditions.push("created_at >= ?"); params.push(from); }
    if (to) { conditions.push("created_at <= ?"); params.push(to); }

    const [[row]] = await db.query(
      `SELECT COUNT(*) AS order_count, COALESCE(SUM(total), 0) AS revenue,
              COALESCE(AVG(total), 0) AS average_order_value
       FROM orders WHERE ${conditions.join(" AND ")}`,
      params
    );
    return row;
  },
};

module.exports = Report;