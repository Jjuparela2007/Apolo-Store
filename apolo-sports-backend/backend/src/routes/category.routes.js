const express = require("express");
const router = express.Router();
const { listCategories, createCategory } = require("../controllers/category.controller");
const { requireAdminAuth } = require("../middleware/auth.middleware");

router.get("/", listCategories); // pública — el menú de navegación la necesita
router.post("/", requireAdminAuth, createCategory);

module.exports = router;
