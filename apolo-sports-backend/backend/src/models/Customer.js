const db = require("../config/db");

const Customer = {
  async findByEmail(email) {
    const [[customer]] = await db.query(`SELECT * FROM customers WHERE email = ?`, [email]);
    return customer || null;
  },

  async findById(id) {
    const [[customer]] = await db.query(
      `SELECT id, email, full_name, phone, email_verified, auth_provider, created_at FROM customers WHERE id = ?`,
      [id]
    );
    return customer || null;
  },

  // Listado para el panel admin: búsqueda por nombre/correo, paginado, con conteo
  // de pedidos y total gastado (solo pedidos efectivamente pagados) por cliente.
  async findAll({ search, page = 1, limit = 20 } = {}) {
    const conditions = [];
    const params = [];
    if (search) {
      conditions.push("(c.full_name LIKE ? OR c.email LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const safeLimit = Math.min(Number(limit) || 20, 100);
    const offset = (Math.max(Number(page) || 1, 1) - 1) * safeLimit;

    const [rows] = await db.query(
      `SELECT c.id, c.email, c.full_name, c.phone, c.email_verified, c.auth_provider, c.created_at,
              (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS order_count,
              (SELECT COALESCE(SUM(o.total), 0) FROM orders o
                 WHERE o.customer_id = c.id
                   AND o.status IN ('paid', 'processing', 'shipped', 'delivered')) AS total_spent
       FROM customers c
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM customers c ${whereClause}`,
      params
    );

    return { customers: rows, total, page: Number(page) || 1, limit: safeLimit };
  },

  // authProvider: 'local' (default, con contraseña) o 'google' (sin contraseña, passwordHash null)
  async create({ email, passwordHash = null, fullName, phone = null, authProvider = "local" }) {
    const [result] = await db.query(
      `INSERT INTO customers (email, password_hash, full_name, phone, auth_provider) VALUES (?, ?, ?, ?, ?)`,
      [email, passwordHash, fullName, phone, authProvider]
    );
    return this.findById(result.insertId);
  },

  async updatePassword(id, passwordHash) {
    await db.query(`UPDATE customers SET password_hash = ? WHERE id = ?`, [passwordHash, id]);
  },

  async updateProfile(id, { fullName, email, phone }) {
    const fields = [];
    const values = [];
    if (fullName !== undefined) { fields.push("full_name = ?"); values.push(fullName); }
    if (email !== undefined) { fields.push("email = ?"); values.push(email); }
    if (phone !== undefined) { fields.push("phone = ?"); values.push(phone); }
    if (fields.length === 0) return this.findById(id);

    await db.query(`UPDATE customers SET ${fields.join(", ")} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  },
};

module.exports = Customer;