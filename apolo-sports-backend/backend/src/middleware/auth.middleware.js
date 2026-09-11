const jwt = require("jsonwebtoken");

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
}

// Protege rutas del sitio público que requieren estar logueado como cliente (carrito, órdenes propias)
function requireCustomerAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "No autorizado. Inicia sesión." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "customer") throw new Error("Tipo de token inválido");
    req.customer = decoded; // { id, email, type }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Sesión inválida o expirada." });
  }
}

// Protege rutas del panel de administración
function requireAdminAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "No autorizado. Falta el token." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "admin") throw new Error("Tipo de token inválido");
    req.admin = decoded; // { id, email, role, type }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ error: "No tienes permiso para esta acción." });
    }
    next();
  };
}

module.exports = { requireCustomerAuth, requireAdminAuth, requireRole };
