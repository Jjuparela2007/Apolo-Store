const db = require("../config/db");

const AdminUser = {
  async findByEmail(email) {
    const [[user]] = await db.query(`SELECT * FROM admin_users WHERE email = ?`, [email]);
    return user || null;
  },

  async findById(id) {
    const [[user]] = await db.query(
      `SELECT id, email, full_name, role, created_at FROM admin_users WHERE id = ?`,
      [id]
    );
    return user || null;
  },

  async create({ email, passwordHash, fullName, role = "staff" }) {
    const [result] = await db.query(
      `INSERT INTO admin_users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)`,
      [email, passwordHash, fullName, role]
    );
    return this.findById(result.insertId);
  },

  async updatePassword(id, passwordHash) {
    await db.query(`UPDATE admin_users SET password_hash = ? WHERE id = ?`, [passwordHash, id]);
  },
};

module.exports = AdminUser;
