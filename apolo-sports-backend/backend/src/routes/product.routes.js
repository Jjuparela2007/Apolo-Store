const express = require("express");
const router = express.Router();
const upload = require("../config/upload");
const {
  listProducts, getProduct, getProductBySlug, createProduct, updateProduct, deleteProduct,
  addVariant, updateVariant, deleteVariant, uploadImages, deleteImage,
} = require("../controllers/product.controller");
const { requireAdminAuth, requireRole } = require("../middleware/auth.middleware");

// Públicas — catálogo del sitio
router.get("/", listProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProduct);

// Administración
router.post("/", requireAdminAuth, createProduct);
router.put("/:id", requireAdminAuth, updateProduct);
// Esta ruta va ANTES de "DELETE /:id" a propósito: Express prueba rutas en orden,
// y "/:id" haría match con "/images/5" (tomando id="images") si fuera primero.
router.delete("/images/:mediaId", requireAdminAuth, deleteImage);
router.delete("/:id", requireAdminAuth, requireRole("owner"), deleteProduct);
router.post("/:id/variants", requireAdminAuth, addVariant);
router.put("/variants/:variantId", requireAdminAuth, updateVariant);
router.delete("/variants/:variantId", requireAdminAuth, deleteVariant);
router.post("/:id/images", requireAdminAuth, upload.array("images", 5), uploadImages);

module.exports = router;
