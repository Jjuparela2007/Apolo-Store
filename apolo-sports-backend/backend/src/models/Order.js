const db = require("../config/db");
const Cart = require("./Cart");
const ProductVariant = require("./ProductVariant");
const { calculateTotalWithSurcharge } = require("../services/pricing.service");

function generateOrderNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${year}-${random}`;
}

const Order = {
  async findById(id) {
    const [[order]] = await db.query(`SELECT * FROM orders WHERE id = ?`, [id]);
    if (!order) return null;
    const [items] = await db.query(`SELECT * FROM order_items WHERE order_id = ?`, [id]);
    const [payments] = await db.query(`SELECT * FROM payments WHERE order_id = ?`, [id]);
    return { ...order, items, payments };
  },

  // Historial de pedidos de un cliente autenticado
  async findByCustomer(customerId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [customerId, limit, offset]
    );
    return rows;
  },

  async findAll({ status, page = 1, limit = 20 } = {}) {
    const conditions = [];
    const params = [];
    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return rows;
  },

  // Calcula el desglose (subtotal + envío + recargo = total) SIN crear la
  // orden todavía — para mostrarlo en el resumen del checkout antes de que
  // el cliente confirme y se abra Wompi.
  async quote({ customerId, shippingCost = 0 }) {
    const { items } = await Cart.getContents(customerId);
    if (!items.length) {
      const err = new Error("El carrito está vacío");
      err.status = 400;
      throw err;
    }

    const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
    const netAmount = subtotal + shippingCost;
    const { surcharge: paymentSurcharge, total } = calculateTotalWithSurcharge(netAmount);

    return { subtotal, shippingCost, paymentSurcharge, total };
  },

  // Crea la orden a partir del carrito ACTUAL del cliente: valida stock, lo reserva,
  // copia los items a order_items, y vacía el carrito — todo en una transacción.
  async createFromCart({ customerId, customerEmail, shippingAddressLine, shippingCity, shippingDepartment, shippingCost = 0 }) {
    const { items } = await Cart.getContents(customerId);
    if (!items.length) {
      const err = new Error("El carrito está vacío");
      err.status = 400;
      throw err;
    }

    const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
    const netAmount = subtotal + shippingCost; // lo que realmente quieres recibir
    const { surcharge: paymentSurcharge, total } = calculateTotalWithSurcharge(netAmount);
    const orderNumber = generateOrderNumber();

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [orderResult] = await conn.query(
        `INSERT INTO orders
          (order_number, customer_id, customer_email, status, subtotal, shipping_cost, payment_surcharge, total,
           shipping_address_line, shipping_city, shipping_department)
         VALUES (?, ?, ?, 'pending_payment', ?, ?, ?, ?, ?, ?, ?)`,
        [orderNumber, customerId, customerEmail, subtotal, shippingCost, paymentSurcharge, total,
          shippingAddressLine, shippingCity, shippingDepartment]
      );
      const orderId = orderResult.insertId;

      for (const item of items) {
        const [[variant]] = await conn.query(
          `SELECT stock FROM product_variants WHERE id = ? FOR UPDATE`,
          [item.variant_id]
        );
        if (!variant || variant.stock < item.quantity) {
          throw Object.assign(
            new Error(`Stock insuficiente para ${item.product_name} (talla ${item.size})`),
            { status: 409 }
          );
        }

        await conn.query(`UPDATE product_variants SET stock = stock - ? WHERE id = ?`, [item.quantity, item.variant_id]);
        await conn.query(
          `INSERT INTO inventory_movements (variant_id, change_qty, reason, reference_id)
           VALUES (?, ?, 'reservation', ?)`,
          [item.variant_id, -item.quantity, orderId]
        );
        await conn.query(
          `INSERT INTO order_items (order_id, variant_id, product_name, size, color, unit_price, quantity)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.variant_id, item.product_name, item.size, item.color, item.unit_price, item.quantity]
        );
      }

      await conn.query(`DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE customer_id = ?)`, [customerId]);

      await conn.commit();
      return this.findById(orderId);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async updateStatus(orderId, status) {
    await db.query(`UPDATE orders SET status = ? WHERE id = ?`, [status, orderId]);

    if (status === "cancelled") {
      const [items] = await db.query(`SELECT variant_id, quantity FROM order_items WHERE order_id = ?`, [orderId]);
      for (const item of items) {
        await ProductVariant.adjustStock({
          variantId: item.variant_id,
          changeQty: item.quantity,
          reason: "reservation_release",
          referenceId: orderId,
        });
      }
    }
    return this.findById(orderId);
  },
};

module.exports = Order;