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

  async updateProfile(id, { fullName, email }) {
    const fields = [];
    const values = [];
    if (fullName !== undefined) { fields.push("full_name = ?"); values.push(fullName); }
    if (email !== undefined) { fields.push("email = ?"); values.push(email); }
    if (fields.length === 0) return this.findById(id);

    await db.query(`UPDATE admin_users SET ${fields.join(", ")} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  },
};

module.exports = AdminUser;
