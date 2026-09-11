const crypto = require("crypto");
const db = require("../config/db");

const RESET_TOKEN_TTL_MINUTES = 30;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const PasswordReset = {
  // Genera un token, guarda solo su hash, y devuelve el token en texto plano
  // (ese es el que se manda por correo — nunca se guarda tal cual en la base de datos).
  async createToken({ accountType, accountId }) {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await db.query(
      `INSERT INTO password_reset_tokens (account_type, account_id, token_hash, expires_at)
       VALUES (?, ?, ?, ?)`,
      [accountType, accountId, tokenHash, expiresAt]
    );

    return token;
  },

  // Valida el token recibido del usuario y lo marca como usado (de un solo uso)
  async consumeToken({ accountType, token }) {
    const tokenHash = hashToken(token);
    const [[row]] = await db.query(
      `SELECT * FROM password_reset_tokens
       WHERE account_type = ? AND token_hash = ? AND used_at IS NULL AND expires_at > NOW()`,
      [accountType, tokenHash]
    );
    if (!row) return null;

    await db.query(`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?`, [row.id]);
    return row;
  },
};

module.exports = PasswordReset;
