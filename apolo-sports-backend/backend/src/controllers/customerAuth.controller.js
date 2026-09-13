const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const PasswordReset = require("../models/PasswordReset");
const email = require("../services/email.service");
const { asyncHandler } = require("../middleware/error.middleware");
const { requireFields, validateEmail, validatePasswordStrength } = require("../middleware/validate.middleware");

function signCustomerToken(customer) {
  return jwt.sign(
    { id: customer.id, email: customer.email, type: "customer" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.CUSTOMER_JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { email: rawEmail, password, fullName, phone } = req.body;
  requireFields(req.body, ["email", "password", "fullName"]);
  validateEmail(rawEmail);
  validatePasswordStrength(password);

  const normalizedEmail = rawEmail.trim().toLowerCase();
  const existing = await Customer.findByEmail(normalizedEmail);
  if (existing) {
    const err = new Error("Ya existe una cuenta con ese correo.");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const customer = await Customer.create({ email: normalizedEmail, passwordHash, fullName, phone });

  const token = signCustomerToken(customer);
  res.status(201).json({ token, customer });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email: rawEmail, password } = req.body;
  requireFields(req.body, ["email", "password"]);

  const customer = await Customer.findByEmail(rawEmail.trim().toLowerCase());
  if (!customer) {
    const err = new Error("Credenciales inválidas.");
    err.status = 401;
    throw err;
  }

  const validPassword = await bcrypt.compare(password, customer.password_hash);
  if (!validPassword) {
    const err = new Error("Credenciales inválidas.");
    err.status = 401;
    throw err;
  }

  const token = signCustomerToken(customer);
  res.json({
    token,
    customer: { id: customer.id, email: customer.email, fullName: customer.full_name },
  });
});

// POST /api/auth/forgot-password
// Siempre responde 200 con el mismo mensaje, exista o no la cuenta — así no se puede
// usar este endpoint para averiguar qué correos están registrados.
const forgotPassword = asyncHandler(async (req, res) => {
  const { email: rawEmail } = req.body;
  requireFields(req.body, ["email"]);

  const customer = await Customer.findByEmail(rawEmail.trim().toLowerCase());
  if (customer) {
    const token = await PasswordReset.createToken({ accountType: "customer", accountId: customer.id });
    const resetUrl = `${process.env.FRONTEND_URL}/restablecer-contrasena?token=${token}`;
    await email.sendPasswordResetEmail({ to: customer.email, resetUrl });
  }

  res.json({ message: "Si el correo existe, te enviamos un enlace para restablecer tu contraseña." });
});

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  requireFields(req.body, ["token", "newPassword"]);
  validatePasswordStrength(newPassword);

  const tokenRow = await PasswordReset.consumeToken({ accountType: "customer", token });
  if (!tokenRow) {
    const err = new Error("El enlace es inválido o ya expiró. Solicita uno nuevo.");
    err.status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await Customer.updatePassword(tokenRow.account_id, passwordHash);

  res.json({ message: "Contraseña actualizada. Ya puedes iniciar sesión." });
});

// GET /api/auth/me  (protegido — requiere sesión, usa req.customer del JWT)
const getMe = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.customer.id);
  if (!customer) {
    const err = new Error("Cliente no encontrado");
    err.status = 404;
    throw err;
  }
  res.json({ customer });
});

// PUT /api/auth/me  (protegido) — actualizar nombre, correo y/o teléfono
const updateMe = asyncHandler(async (req, res) => {
  const { fullName, email: rawEmail, phone } = req.body;

  let normalizedEmail;
  if (rawEmail !== undefined) {
    validateEmail(rawEmail);
    normalizedEmail = rawEmail.trim().toLowerCase();

    if (normalizedEmail !== req.customer.email) {
      const existing = await Customer.findByEmail(normalizedEmail);
      if (existing) {
        const err = new Error("Ya existe una cuenta con ese correo.");
        err.status = 409;
        throw err;
      }
    }
  }

  const customer = await Customer.updateProfile(req.customer.id, { fullName, email: normalizedEmail, phone });

  // El correo va dentro del JWT — si cambió, hay que firmar uno nuevo para que
  // las siguientes peticiones (y el nombre mostrado en el sitio) queden al día.
  const token = signCustomerToken(customer);

  res.json({
    token,
    customer: { id: customer.id, email: customer.email, fullName: customer.full_name, phone: customer.phone },
  });
});

// PUT /api/auth/change-password  (protegido) — exige la contraseña actual
const changePassword = asyncHandler(async (req, res) => {
  requireFields(req.body, ["currentPassword", "newPassword"]);
  const { currentPassword, newPassword } = req.body;
  validatePasswordStrength(newPassword);

  const fullCustomer = await Customer.findByEmail(req.customer.email);
  const validPassword = await bcrypt.compare(currentPassword, fullCustomer.password_hash);
  if (!validPassword) {
    const err = new Error("La contraseña actual no es correcta.");
    err.status = 401;
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await Customer.updatePassword(req.customer.id, passwordHash);

  res.json({ message: "Contraseña actualizada correctamente." });
});

module.exports = { register, login, forgotPassword, resetPassword, getMe, updateMe, changePassword };