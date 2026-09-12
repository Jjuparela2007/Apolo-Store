const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const PasswordReset = require("../models/PasswordReset");
const email = require("../services/email.service");
const { asyncHandler } = require("../middleware/error.middleware");
const { requireFields, validateEmail, validatePasswordStrength } = require("../middleware/validate.middleware");

function signAdminToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, type: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
}

// POST /api/admin/auth/login
const login = asyncHandler(async (req, res) => {
  const { email: rawEmail, password } = req.body;
  requireFields(req.body, ["email", "password"]);

  const user = await AdminUser.findByEmail(rawEmail.trim().toLowerCase());
  if (!user) {
    const err = new Error("Credenciales inválidas.");
    err.status = 401;
    throw err;
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    const err = new Error("Credenciales inválidas.");
    err.status = 401;
    throw err;
  }

  const token = signAdminToken(user);
  res.json({
    token,
    user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
  });
});

// POST /api/admin/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email: rawEmail } = req.body;
  requireFields(req.body, ["email"]);

  const user = await AdminUser.findByEmail(rawEmail.trim().toLowerCase());
  if (user) {
    const token = await PasswordReset.createToken({ accountType: "admin", accountId: user.id });
    // El panel admin es una app separada del sitio público, con su propia URL base
    // (ej. http://localhost:5174 en desarrollo) — nunca comparte FRONTEND_URL.
    const adminUrl = process.env.ADMIN_URL || "http://localhost:5174";
    const resetUrl = `${adminUrl}/restablecer-contrasena?token=${token}`;
    await email.sendPasswordResetEmail({ to: user.email, resetUrl });
  }

  res.json({ message: "Si el correo existe, te enviamos un enlace para restablecer tu contraseña." });
});

// POST /api/admin/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  requireFields(req.body, ["token", "newPassword"]);
  validatePasswordStrength(newPassword);

  const tokenRow = await PasswordReset.consumeToken({ accountType: "admin", token });
  if (!tokenRow) {
    const err = new Error("El enlace es inválido o ya expiró. Solicita uno nuevo.");
    err.status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await AdminUser.updatePassword(tokenRow.account_id, passwordHash);

  res.json({ message: "Contraseña actualizada." });
});

// GET /api/admin/auth/me  (protegido — requiere sesión, usa req.admin del JWT)
const getMe = asyncHandler(async (req, res) => {
  const user = await AdminUser.findById(req.admin.id);
  if (!user) {
    const err = new Error("Usuario no encontrado");
    err.status = 404;
    throw err;
  }
  res.json({ user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role } });
});

// PUT /api/admin/auth/me  (protegido) — actualizar nombre y/o correo
const updateMe = asyncHandler(async (req, res) => {
  const { fullName, email: rawEmail } = req.body;

  let normalizedEmail;
  if (rawEmail !== undefined) {
    validateEmail(rawEmail);
    normalizedEmail = rawEmail.trim().toLowerCase();

    // Si va a cambiar el correo, confirma que no choque con otra cuenta ya existente.
    if (normalizedEmail !== req.admin.email) {
      const existing = await AdminUser.findByEmail(normalizedEmail);
      if (existing) {
        const err = new Error("Ya existe una cuenta de administrador con ese correo.");
        err.status = 409;
        throw err;
      }
    }
  }

  const user = await AdminUser.updateProfile(req.admin.id, { fullName, email: normalizedEmail });

  // El correo va dentro del JWT — como cambió, hay que firmar uno nuevo para que
  // las siguientes peticiones (y el nombre mostrado en el panel) queden al día.
  const token = signAdminToken(user);

  res.json({
    token,
    user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
  });
});

// PUT /api/admin/auth/change-password  (protegido) — exige la contraseña actual
const changePassword = asyncHandler(async (req, res) => {
  requireFields(req.body, ["currentPassword", "newPassword"]);
  const { currentPassword, newPassword } = req.body;
  validatePasswordStrength(newPassword);

  const user = await AdminUser.findById(req.admin.id);
  // findById no trae password_hash (por diseño, para no filtrarlo en otras respuestas) —
  // se busca por email para tener el hash y poder compararlo.
  const fullUser = await AdminUser.findByEmail(user.email);

  const validPassword = await bcrypt.compare(currentPassword, fullUser.password_hash);
  if (!validPassword) {
    const err = new Error("La contraseña actual no es correcta.");
    err.status = 401;
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await AdminUser.updatePassword(req.admin.id, passwordHash);

  res.json({ message: "Contraseña actualizada correctamente." });
});

module.exports = { login, forgotPassword, resetPassword, getMe, updateMe, changePassword };