const db = require("../config/db");
const Cart = require("./Cart");
const ProductVariant = require("./ProductVariant");

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

  async findAll({ status, channel, page = 1, limit = 20 } = {}) {
    const conditions = [];
    const params = [];
    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (channel) {
      conditions.push("channel = ?");
      params.push(channel);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return rows;
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
    const total = subtotal + shippingCost;
    const orderNumber = generateOrderNumber();

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [orderResult] = await conn.query(
        `INSERT INTO orders
          (order_number, customer_id, customer_email, status, subtotal, shipping_cost, total,
           shipping_address_line, shipping_city, shipping_department)
         VALUES (?, ?, ?, 'pending_payment', ?, ?, ?, ?, ?, ?)`,
        [orderNumber, customerId, customerEmail, subtotal, shippingCost, total,
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

  // Venta registrada manualmente por el admin (mostrador/local físico) — a diferencia
  // de createFromCart, no viene de un carrito de cliente: el admin elige los productos
  // directo. Queda pagada de inmediato (no pasa por Wompi) y descuenta stock igual que
  // cualquier otra venta, con el mismo control de concurrencia (FOR UPDATE).
  // items: [{ variantId, quantity }]
  async createManualSale({ items, paymentMethod, walkInCustomerName, walkInCustomerPhone, adminId }) {
    if (!items || items.length === 0) {
      const err = new Error("Agrega al menos un producto a la venta");
      err.status = 400;
      throw err;
    }

    const orderNumber = generateOrderNumber();

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      let subtotal = 0;
      const resolvedItems = [];

      for (const item of items) {
        // El precio se toma del producto en este momento (nunca del frontend) para
        // que el admin no pueda —sin querer o a propósito— vender a un precio distinto
        // al que el sistema tiene registrado.
        const [[variant]] = await conn.query(
          `SELECT pv.id, pv.size, pv.color, pv.stock, p.name AS product_name,
                  COALESCE(p.offer_price, p.base_price) AS unit_price
           FROM product_variants pv
           JOIN products p ON p.id = pv.product_id
           WHERE pv.id = ? FOR UPDATE`,
          [item.variantId]
        );
        if (!variant) {
          throw Object.assign(new Error(`La variante ${item.variantId} no existe`), { status: 404 });
        }
        if (variant.stock < item.quantity) {
          throw Object.assign(
            new Error(`Stock insuficiente para ${variant.product_name} (talla ${variant.size})`),
            { status: 409 }
          );
        }

        subtotal += variant.unit_price * item.quantity;
        resolvedItems.push({ ...variant, quantity: item.quantity });
      }

      const [orderResult] = await conn.query(
        `INSERT INTO orders
          (order_number, customer_id, customer_email, walk_in_customer_name, walk_in_customer_phone,
           status, channel, subtotal, shipping_cost, total)
         VALUES (?, NULL, NULL, ?, ?, 'paid', 'local', ?, 0, ?)`,
        [orderNumber, walkInCustomerName || null, walkInCustomerPhone || null, subtotal, subtotal]
      );
      const orderId = orderResult.insertId;

      for (const item of resolvedItems) {
        await conn.query(`UPDATE product_variants SET stock = stock - ? WHERE id = ?`, [item.quantity, item.id]);
        await conn.query(
          `INSERT INTO inventory_movements (variant_id, change_qty, reason, reference_id)
           VALUES (?, ?, 'sale', ?)`,
          [item.id, -item.quantity, orderId]
        );
        await conn.query(
          `INSERT INTO order_items (order_id, variant_id, product_name, size, color, unit_price, quantity)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.id, item.product_name, item.size, item.color, item.unit_price, item.quantity]
        );
      }

      // Se registra en la misma tabla de pagos que usa Wompi, pero con provider "manual" —
      // así los reportes que ya suman "payments" no necesitan tratar esta venta distinto.
      await conn.query(
        `INSERT INTO payments (order_id, provider, provider_tx_id, payment_method, status, amount, raw_response)
         VALUES (?, 'manual', ?, ?, 'approved', ?, ?)`,
        [orderId, `manual-${orderId}`, paymentMethod, subtotal, JSON.stringify({ registeredByAdminId: adminId })]
      );

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