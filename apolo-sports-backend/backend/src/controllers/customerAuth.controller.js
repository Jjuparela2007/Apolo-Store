const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const Customer = require("../models/Customer");
const PasswordReset = require("../models/PasswordReset");
const email = require("../services/email.service");
const { asyncHandler } = require("../middleware/error.middleware");
const { requireFields, validateEmail, validatePasswordStrength } = require("../middleware/validate.middleware");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
  if (!customer || !customer.password_hash) {
    // Sin password_hash = cuenta creada solo con Google; no puede entrar con contraseña.
    const err = new Error("El correo o la contraseña no son correctos. Inténtalo nuevamente.");
    err.status = 401;
    throw err;
  }

  const validPassword = await bcrypt.compare(password, customer.password_hash);
  if (!validPassword) {
    const err = new Error("El correo o la contraseña no son correctos. Inténtalo nuevamente.");
    err.status = 401;
    throw err;
  }

  const token = signCustomerToken(customer);
  res.json({
    token,
    customer: { id: customer.id, email: customer.email, fullName: customer.full_name },
  });
});

// POST /api/auth/google
// Recibe el id_token (credential) que genera el botón de Google en el frontend,
// lo verifica contra Google, y crea o reutiliza el cliente correspondiente.
const loginWithGoogle = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  requireFields(req.body, ["credential"]);

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    const e = new Error("No se pudo verificar la sesión de Google.");
    e.status = 401;
    throw e;
  }

  const { email: googleEmail, name, email_verified } = payload;
  if (!email_verified) {
    const err = new Error("Tu correo de Google no está verificado.");
    err.status = 401;
    throw err;
  }

  const normalizedEmail = googleEmail.trim().toLowerCase();
  let customer = await Customer.findByEmail(normalizedEmail);

  if (customer && customer.auth_provider === "local") {
    // Ya existe una cuenta creada con contraseña para este correo.
    // No la fusionamos automáticamente: el usuario debe entrar con su contraseña.
    const err = new Error("Ya existe una cuenta con este correo. Inicia sesión con tu contraseña.");
    err.status = 409;
    throw err;
  }

  if (!customer) {
    customer = await Customer.create({
      email: normalizedEmail,
      passwordHash: null,
      fullName: name,
      phone: null,
      authProvider: "google",
    });
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
  if (customer && customer.password_hash) {
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
  if (!fullCustomer.password_hash) {
    const err = new Error("Esta cuenta inició sesión con Google y no tiene contraseña configurada.");
    err.status = 400;
    throw err;
  }

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

module.exports = {
  register,
  login,
  loginWithGoogle,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
  changePassword,
};