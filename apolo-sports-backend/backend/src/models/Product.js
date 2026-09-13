const db = require("../config/db");

// Convierte el error crudo de MySQL (ER_DUP_ENTRY) en un mensaje que el panel admin
// puede mostrarle directamente al usuario, en vez del genérico "Error interno del servidor".
function translateDuplicateError(err) {
  if (err.code !== "ER_DUP_ENTRY") return err;

  let field = "un campo único";
  if (err.sqlMessage?.includes("slug")) field = "el slug (URL del producto)";
  else if (err.sqlMessage?.includes("sku")) field = "el SKU";

  const friendly = new Error(
    `Ya existe otro producto con ${field} que estás usando. Cámbialo por uno distinto e intenta de nuevo.`
  );
  friendly.status = 409;
  return friendly;
}

const Product = {
  // Catálogo público con búsqueda, filtro por categoría y paginación
  async findAll({ categoryId, search, status = "published", page = 1, limit = 20 } = {}) {
    const conditions = [];
    const params = [];

    // status=null/undefined viene del panel admin pidiendo "todos los estados" —
    // en ese caso no se filtra por status en absoluto.
    if (status) {
      conditions.push("p.status = ?");
      params.push(status);
    }

    // categoryId puede ser un solo id, o un array de ids (ej. la categoría padre +
    // todas sus subcategorías, para que "Todos" dentro de Hombre muestre también
    // los productos que están asignados directamente a Camisetas, Pantalones, etc.)
    if (categoryId) {
      const ids = Array.isArray(categoryId) ? categoryId : [categoryId];
      conditions.push(`p.category_id IN (${ids.map(() => "?").join(",")})`);
      params.push(...ids);
    }
    if (search) {
      conditions.push("(p.name LIKE ? OR p.short_description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const safeLimit = Math.min(Number(limit) || 20, 100);
    const offset = (Math.max(Number(page) || 1, 1) - 1) * safeLimit;
    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await db.query(
      `SELECT p.id, p.name, p.slug, p.short_description, p.base_price, p.offer_price,
              p.featured, p.status, p.category_id, c.name AS category_name,
              (SELECT url FROM product_media m WHERE m.product_id = p.id
                 ORDER BY m.sort_order ASC LIMIT 1) AS thumbnail_url,
              (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.id) AS variant_count,
              (SELECT v.id FROM product_variants v WHERE v.product_id = p.id
                 ORDER BY (v.stock > 0) DESC, v.id ASC LIMIT 1) AS default_variant_id
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM products p ${whereClause}`,
      params
    );

    return { products: rows, total, page: Number(page) || 1, limit: safeLimit };
  },

  async findById(id) {
    const [[product]] = await db.query(
      `SELECT p.*, c.name AS category_name
       FROM products p JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?`,
      [id]
    );
    if (!product) return null;

    const [variants] = await db.query(
      `SELECT id, size, color, color_hex, stock, low_stock_threshold
       FROM product_variants WHERE product_id = ?`,
      [id]
    );
    const [media] = await db.query(
      `SELECT id, url, media_type, sort_order FROM product_media
       WHERE product_id = ? ORDER BY sort_order ASC`,
      [id]
    );

    return { ...product, variants, media };
  },

  async findBySlug(slug) {
    const [[row]] = await db.query(`SELECT id FROM products WHERE slug = ?`, [slug]);
    return row ? this.findById(row.id) : null;
  },

  async create({ categoryId, brand, name, slug, shortDescription, description, basePrice,
                 offerPrice, sku, featured, taxable, visibility, status }) {
    try {
      const [result] = await db.query(
        `INSERT INTO products
          (category_id, brand, name, slug, short_description, description, base_price,
           offer_price, sku, featured, taxable, visibility, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [categoryId, brand || "Apolo Sports", name, slug, shortDescription || null, description || null,
          basePrice, offerPrice || null, sku, !!featured, !!taxable,
          visibility || "store_and_search", status || "draft"]
      );
      return this.findById(result.insertId);
    } catch (err) {
      throw translateDuplicateError(err);
    }
  },

  async update(id, fields) {
    // Mapea los nombres camelCase que manda el frontend a las columnas snake_case
    // de la tabla. Cualquier campo que no esté en este mapa se ignora (nunca se
    // actualiza con un valor arbitrario que no reconozcamos).
    const fieldMap = {
      categoryId: "category_id",
      brand: "brand",
      name: "name",
      slug: "slug",
      shortDescription: "short_description",
      description: "description",
      basePrice: "base_price",
      offerPrice: "offer_price",
      sku: "sku",
      featured: "featured",
      taxable: "taxable",
      visibility: "visibility",
      status: "status",
    };

    const updates = Object.keys(fields).filter((k) => fieldMap[k] !== undefined);
    if (updates.length === 0) return this.findById(id);

    const setClause = updates.map((k) => `${fieldMap[k]} = ?`).join(", ");
    const values = updates.map((k) => fields[k]);
    try {
      await db.query(`UPDATE products SET ${setClause} WHERE id = ?`, [...values, id]);
    } catch (err) {
      throw translateDuplicateError(err);
    }
    return this.findById(id);
  },

  // Borrado lógico: se archiva en vez de borrarse, para no romper el historial de órdenes
  async remove(id) {
    await db.query(`UPDATE products SET status = 'archived' WHERE id = ?`, [id]);
  },

  async addMedia(productId, { url, mediaType = "image", sortOrder = 0 }) {
    const [result] = await db.query(
      `INSERT INTO product_media (product_id, url, media_type, sort_order) VALUES (?, ?, ?, ?)`,
      [productId, url, mediaType, sortOrder]
    );
    return result.insertId;
  },

  async findMediaById(mediaId) {
    const [[row]] = await db.query(`SELECT * FROM product_media WHERE id = ?`, [mediaId]);
    return row || null;
  },

  async removeMedia(mediaId) {
    await db.query(`DELETE FROM product_media WHERE id = ?`, [mediaId]);
  },
};

module.exports = Product;