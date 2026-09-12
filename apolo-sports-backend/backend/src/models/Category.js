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

  async update(id, { name, slug, parentId }) {
    const fields = [];
    const values = [];
    if (name !== undefined) { fields.push("name = ?"); values.push(name); }
    if (slug !== undefined) { fields.push("slug = ?"); values.push(slug); }
    if (parentId !== undefined) { fields.push("parent_id = ?"); values.push(parentId); }
    if (fields.length === 0) return this.findById(id);

    await db.query(`UPDATE categories SET ${fields.join(", ")} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  },

  // No permite borrar una categoría que tiene productos o subcategorías —
  // evita dejar productos "huérfanos" apuntando a una categoría inexistente.
  async remove(id) {
    const [[{ productCount }]] = await db.query(
      `SELECT COUNT(*) AS productCount FROM products WHERE category_id = ?`, [id]
    );
    if (productCount > 0) {
      const err = new Error(`No se puede borrar: hay ${productCount} producto(s) en esta categoría.`);
      err.status = 409;
      throw err;
    }

    const [[{ childCount }]] = await db.query(
      `SELECT COUNT(*) AS childCount FROM categories WHERE parent_id = ?`, [id]
    );
    if (childCount > 0) {
      const err = new Error(`No se puede borrar: tiene ${childCount} subcategoría(s). Bórralas primero.`);
      err.status = 409;
      throw err;
    }

    await db.query(`DELETE FROM categories WHERE id = ?`, [id]);
  },
};

module.exports = Category;