const path = require("path");
const fs = require("fs");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const { asyncHandler } = require("../middleware/error.middleware");
const { requireFields } = require("../middleware/validate.middleware");

// GET /api/products?category=1&search=camiseta&page=1&featured=true
// category también acepta varios ids separados por coma: category=1,4,5
const listProducts = asyncHandler(async (req, res) => {
  const { category, search, page, status, featured } = req.query;
  // status=all (usado por el panel admin) quita el filtro de status por completo.
  // Sin parámetro, el catálogo público solo ve productos publicados.
  const resolvedStatus = status === "all" ? null : status || "published";
  const categoryId = category ? category.split(",").map((id) => id.trim()).filter(Boolean) : undefined;
  const result = await Product.findAll({
    categoryId,
    search,
    featured: featured === "true",
    status: resolvedStatus,
    page,
  });
  res.json(result);
});

// GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    const err = new Error("Producto no encontrado");
    err.status = 404;
    throw err;
  }
  res.json({ product });
});

// GET /api/products/slug/:slug  (para la ficha pública, URL amigable)
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findBySlug(req.params.slug);
  if (!product) {
    const err = new Error("Producto no encontrado");
    err.status = 404;
    throw err;
  }
  res.json({ product });
});

// POST /api/admin/products  (protegido)
const createProduct = asyncHandler(async (req, res) => {
  requireFields(req.body, ["categoryId", "name", "slug", "basePrice", "sku"]);
  const product = await Product.create(req.body);
  res.status(201).json({ product });
});

// PUT /api/admin/products/:id  (protegido)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.update(req.params.id, req.body);
  res.json({ product });
});

// DELETE /api/admin/products/:id  (protegido) — borrado lógico (se archiva)
const deleteProduct = asyncHandler(async (req, res) => {
  await Product.remove(req.params.id);
  res.status(204).send();
});

// POST /api/admin/products/:id/variants  (protegido)
const addVariant = asyncHandler(async (req, res) => {
  requireFields(req.body, ["size"]);
  const variant = await ProductVariant.create({ productId: req.params.id, ...req.body });
  res.status(201).json({ variant });
});

// PUT /api/admin/products/variants/:variantId  (protegido) — editar stock/talla/color
const updateVariant = asyncHandler(async (req, res) => {
  const variant = await ProductVariant.update(req.params.variantId, req.body);
  res.json({ variant });
});

// PATCH /api/admin/products/variants/:variantId/visibility  (protegido)
// Oculta o muestra la variante en la tienda sin borrarla — útil cuando ya no
// queda inventario y no se puede eliminar por tener movimientos registrados.
const setVariantVisibility = asyncHandler(async (req, res) => {
  requireFields(req.body, ["isActive"]);
  const variant = await ProductVariant.update(req.params.variantId, { isActive: req.body.isActive });
  res.json({ variant });
});

// DELETE /api/admin/products/variants/:variantId  (protegido)
const deleteVariant = asyncHandler(async (req, res) => {
  try {
    await ProductVariant.remove(req.params.variantId);
    res.status(204).send();
  } catch (err) {
    // La variante ya tiene movimientos de inventario asociados (ventas, ajustes, etc.)
    // y la FK de inventory_movements impide borrarla. En vez de un 500 genérico,
    // se devuelve un mensaje accionable para que el admin edite en vez de eliminar.
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      const friendlyErr = new Error(
        "Esta variante tiene movimientos de inventario registrados y no se puede eliminar. Edítala en su lugar."
      );
      friendlyErr.status = 409;
      throw friendlyErr;
    }
    throw err;
  }
});

// POST /api/admin/products/:id/images  (protegido) — multipart/form-data, campo "images" (hasta 5)
// La validación de formato y tamaño ya la hace el middleware de multer (config/upload.js)
const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    const err = new Error("No se recibió ninguna imagen.");
    err.status = 400;
    throw err;
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const mediaIds = [];
  for (let i = 0; i < req.files.length; i++) {
    const url = `${baseUrl}/uploads/products/${req.files[i].filename}`;
    const id = await Product.addMedia(req.params.id, { url, mediaType: "image", sortOrder: i });
    mediaIds.push({ id, url });
  }

  res.status(201).json({ media: mediaIds });
});

// DELETE /api/admin/products/images/:mediaId  (protegido)
const deleteImage = asyncHandler(async (req, res) => {
  const media = await Product.findMediaById(req.params.mediaId);
  if (!media) {
    const err = new Error("Imagen no encontrada");
    err.status = 404;
    throw err;
  }

  await Product.removeMedia(req.params.mediaId);

  // Borra también el archivo físico del disco — solo si es una ruta local de /uploads/products/
  // (por si en el futuro se guardan imágenes en una URL externa, no se intenta borrar esa).
  const filename = media.url.split("/uploads/products/")[1];
  if (filename) {
    const filePath = path.join(__dirname, "..", "..", "uploads", "products", filename);
    fs.unlink(filePath, (err) => {
      if (err) console.warn(`No se pudo borrar el archivo ${filePath}:`, err.message);
    });
  }

  res.status(204).send();
});

module.exports = {
  listProducts, getProduct, getProductBySlug, createProduct, updateProduct, deleteProduct,
  addVariant, updateVariant, setVariantVisibility, deleteVariant, uploadImages, deleteImage,
};