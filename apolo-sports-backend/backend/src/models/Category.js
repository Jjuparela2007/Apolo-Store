const db = require("../config/db");

const Category = {
  async findAll() {
    const [rows] = await db.query(
      `SELECT id, name, slug, parent_id FROM categories ORDER BY parent_id IS NULL DESC, name ASC`
    );
    return rows;
  },

  async findById(id) {
    const [[category]] = await db.query(`SELECT * FROM categories WHERE id = ?`, [id]);
    return category || null;
  },

  async create({ name, slug, parentId = null }) {
    const [result] = await db.query(
      `INSERT INTO categories (name, slug, parent_id) VALUES (?, ?, ?)`,
      [name, slug, parentId]
    );
    return this.findById(result.insertId);
  },
};

module.exports = Category;
