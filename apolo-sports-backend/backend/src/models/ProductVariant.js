const db = require("../config/db");

const ProductVariant = {
  async findById(id) {
    const [[variant]] = await db.query(`SELECT * FROM product_variants WHERE id = ?`, [id]);
    return variant || null;
  },

  async create({ productId, size, color = "Único", colorHex = null, stock = 0, lowStockThreshold = 5 }) {
    const [result] = await db.query(
      `INSERT INTO product_variants (product_id, size, color, color_hex, stock, low_stock_threshold)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [productId, size, color, colorHex, stock, lowStockThreshold]
    );
    return this.findById(result.insertId);
  },

  async update(id, fields) {
    const allowed = ["size", "color", "color_hex", "stock", "low_stock_threshold"];
    const updates = Object.keys(fields).filter((k) => allowed.includes(k));
    if (updates.length === 0) return this.findById(id);
    const setClause = updates.map((k) => `${k} = ?`).join(", ");
    const values = updates.map((k) => fields[k]);
    await db.query(`UPDATE product_variants SET ${setClause} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  },

  async remove(id) {
    await db.query(`DELETE FROM product_variants WHERE id = ?`, [id]);
  },

  // Ajuste manual de stock (entradas de proveedor, correcciones), con auditoría.
  async adjustStock({ variantId, changeQty, reason, referenceId = null }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [[variant]] = await conn.query(
        `SELECT id, stock FROM product_variants WHERE id = ? FOR UPDATE`,
        [variantId]
      );
      if (!variant) throw new Error("Variante no encontrada");

      const newStock = variant.stock + changeQty;
      if (newStock < 0) throw new Error("Stock insuficiente para esta variante");

      await conn.query(`UPDATE product_variants SET stock = ? WHERE id = ?`, [newStock, variantId]);
      await conn.query(
        `INSERT INTO inventory_movements (variant_id, change_qty, reason, reference_id)
         VALUES (?, ?, ?, ?)`,
        [variantId, changeQty, reason, referenceId]
      );

      await conn.commit();
      return newStock;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async findLowStock(productId = null) {
    const params = [];
    let where = "pv.stock <= pv.low_stock_threshold";
    if (productId) {
      where += " AND pv.product_id = ?";
      params.push(productId);
    }
    const [rows] = await db.query(
      `SELECT
         pv.id                  AS variant_id,
         pv.product_id,
         p.name                 AS product_name,
         p.sku                  AS product_sku,
         pv.size,
         pv.color,
         pv.stock,
         pv.low_stock_threshold,
         (pv.low_stock_threshold - pv.stock) AS deficit
       FROM product_variants pv
       JOIN products p ON p.id = pv.product_id
       WHERE ${where}
       ORDER BY deficit DESC`,
      params
    );
    return rows;
  },
};

module.exports = ProductVariant;
