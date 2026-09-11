const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const PasswordReset = require("../models/PasswordReset");
const email = require("../services/email.service");
const { asyncHandler } = require("../middleware/error.middleware");
const { requireFields, validatePasswordStrength } = require("../middleware/validate.middleware");

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
    const resetUrl = `${process.env.FRONTEND_URL}/admin/restablecer-contrasena?token=${token}`;
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

module.exports = { login, forgotPassword, resetPassword };
