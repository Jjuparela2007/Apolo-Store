const db = require("../config/db");

const Cart = {
  // Cada cliente tiene un único carrito; se crea la primera vez que lo necesita
  async getOrCreateForCustomer(customerId) {
    const [[existing]] = await db.query(`SELECT id FROM carts WHERE customer_id = ?`, [customerId]);
    if (existing) return existing.id;

    const [result] = await db.query(`INSERT INTO carts (customer_id) VALUES (?)`, [customerId]);
    return result.insertId;
  },

  // Devuelve el carrito con cada item enriquecido con datos del producto/variante,
  // y el precio vigente (offer_price si existe, si no base_price) para que el
  // frontend no tenga que recalcular nada.
  async getContents(customerId) {
    const cartId = await this.getOrCreateForCustomer(customerId);

    const [items] = await db.query(
      `SELECT ci.id AS cart_item_id, ci.quantity, ci.variant_id,
              pv.size, pv.color, pv.stock,
              p.id AS product_id, p.name AS product_name, p.slug,
              COALESCE(p.offer_price, p.base_price) AS unit_price,
              (SELECT url FROM product_media m WHERE m.product_id = p.id
                 ORDER BY m.sort_order ASC LIMIT 1) AS thumbnail_url
       FROM cart_items ci
       JOIN product_variants pv ON pv.id = ci.variant_id
       JOIN products p ON p.id = pv.product_id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
    return { cartId, items, subtotal };
  },

  // Agrega un item, o si ya existe esa variante en el carrito, suma la cantidad.
  async addItem(customerId, { variantId, quantity = 1 }) {
    const cartId = await this.getOrCreateForCustomer(customerId);

    const [[variant]] = await db.query(`SELECT stock FROM product_variants WHERE id = ?`, [variantId]);
    if (!variant) {
      const err = new Error("La variante de producto no existe");
      err.status = 404;
      throw err;
    }

    await db.query(
      `INSERT INTO cart_items (cart_id, variant_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [cartId, variantId, quantity]
    );

    return this.getContents(customerId);
  },

  async updateItemQuantity(customerId, cartItemId, quantity) {
    const cartId = await this.getOrCreateForCustomer(customerId);
    if (quantity <= 0) {
      await db.query(`DELETE FROM cart_items WHERE id = ? AND cart_id = ?`, [cartItemId, cartId]);
    } else {
      await db.query(
        `UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?`,
        [quantity, cartItemId, cartId]
      );
    }
    return this.getContents(customerId);
  },

  async removeItem(customerId, cartItemId) {
    const cartId = await this.getOrCreateForCustomer(customerId);
    await db.query(`DELETE FROM cart_items WHERE id = ? AND cart_id = ?`, [cartItemId, cartId]);
    return this.getContents(customerId);
  },

  async clear(customerId) {
    const cartId = await this.getOrCreateForCustomer(customerId);
    await db.query(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);
  },
};

module.exports = Cart;
