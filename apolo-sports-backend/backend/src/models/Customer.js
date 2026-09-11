const db = require("../config/db");

const Customer = {
  async findByEmail(email) {
    const [[customer]] = await db.query(`SELECT * FROM customers WHERE email = ?`, [email]);
    return customer || null;
  },

  async findById(id) {
    const [[customer]] = await db.query(
      `SELECT id, email, full_name, phone, email_verified, created_at FROM customers WHERE id = ?`,
      [id]
    );
    return customer || null;
  },

  async create({ email, passwordHash, fullName, phone = null }) {
    const [result] = await db.query(
      `INSERT INTO customers (email, password_hash, full_name, phone) VALUES (?, ?, ?, ?)`,
      [email, passwordHash, fullName, phone]
    );
    return this.findById(result.insertId);
  },

  async updatePassword(id, passwordHash) {
    await db.query(`UPDATE customers SET password_hash = ? WHERE id = ?`, [passwordHash, id]);
  },
};

module.exports = Customer;
