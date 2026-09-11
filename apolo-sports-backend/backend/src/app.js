const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const customerAuthRoutes = require("./routes/customerAuth.routes");
const adminAuthRoutes = require("./routes/adminAuth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const adminOrderRoutes = require("./routes/adminOrder.routes");
const paymentRoutes = require("./routes/payment.routes");
const { errorHandler } = require("./middleware/error.middleware");

const app = express();

// En desarrollo corren dos frontends distintos (sitio público y panel admin) en puertos
// diferentes. ALLOWED_ORIGINS acepta una lista separada por comas; si no se define, cae
// en los puertos por defecto de Vite (5173 sitio público, 5174 panel admin) más lo que
// diga FRONTEND_URL, para no romper despliegues existentes que solo configuraron esa var.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean)
  .concat([process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"])
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Peticiones sin origin (curl, Postman, apps móviles) siempre se permiten.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("No permitido por CORS"));
  },
  credentials: true,
}));
app.use(express.json());

// Sirve las imágenes de producto subidas (ej. /uploads/products/169...-foto.jpg)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Cliente (sitio público)
app.use("/api/auth", customerAuthRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

// Administración
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/inventory", inventoryRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
app.use(errorHandler);

module.exports = app;