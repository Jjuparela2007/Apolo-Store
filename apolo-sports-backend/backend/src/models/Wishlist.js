const db = require("../config/db");

const Wishlist = {
  // Lista de favoritos con los datos del producto ya incluidos (para no hacer una
  // segunda consulta por cada item desde el frontend).
  async getForCustomer(customerId) {
    const [rows] = await db.query(
      `SELECT w.id AS wishlist_item_id, w.created_at,
              p.id AS product_id, p.name, p.slug, p.base_price, p.offer_price, p.status,
              (SELECT url FROM product_media m WHERE m.product_id = p.id
                 ORDER BY m.sort_order ASC LIMIT 1) AS thumbnail_url
       FROM wishlist_items w
       JOIN products p ON p.id = w.product_id
       WHERE w.customer_id = ?
       ORDER BY w.created_at DESC`,
      [customerId]
    );
    return rows;
  },

  async addItem(customerId, productId) {
    // INSERT IGNORE: si ya estaba en favoritos (uq_customer_product), no duplica ni truena.
    await db.query(
      `INSERT IGNORE INTO wishlist_items (customer_id, product_id) VALUES (?, ?)`,
      [customerId, productId]
    );
    return this.getForCustomer(customerId);
  },

  async removeItem(customerId, productId) {
    await db.query(
      `DELETE FROM wishlist_items WHERE customer_id = ? AND product_id = ?`,
      [customerId, productId]
    );
    return this.getForCustomer(customerId);
  },
};

module.exports = Wishlist;
