// middleware/requirePhone.middleware.js
//
// Bloquea rutas que exigen un cliente con perfil completo (por ejemplo,
// crear un pedido). Esto existe sobre todo para las cuentas creadas con
// Google, que pueden quedar sin teléfono hasta que el cliente lo completa
// en un paso aparte — las cuentas registradas con el formulario normal ya
// vienen con teléfono obligatorio desde customerAuth.controller.js, así que
// en la práctica esto casi nunca debería frenarlas.
//
// Requiere ir DESPUÉS del middleware de autenticación (el que llena req.customer).
const Customer = require("../models/Customer");
const { asyncHandler } = require("./error.middleware");

const requirePhone = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.customer.id);
  if (!customer) {
    const err = new Error("Cliente no encontrado");
    err.status = 404;
    throw err;
  }

  if (!customer.phone) {
    const err = new Error("Necesitas agregar tu número de teléfono antes de continuar.");
    err.status = 403;
    err.code = "PHONE_REQUIRED"; // el frontend usa este código para redirigir a completar perfil
    throw err;
  }

  next();
});

module.exports = { requirePhone };
