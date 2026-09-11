// Script de un solo uso para crear el primer administrador.
// Uso: node create-admin.js
// Después de crearlo, puedes borrar este archivo si quieres.

const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
require("dotenv").config();

// --- EDITA ESTOS TRES VALORES ANTES DE CORRER EL SCRIPT ---
const EMAIL = "admin@apolosports.com";
const PASSWORD = "admin1234";
const FULL_NAME = "Daniela Admin";
// ------------------------------------------------------------

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await connection.query(
      `INSERT INTO admin_users (email, password_hash, full_name, role) VALUES (?, ?, ?, 'owner')`,
      [EMAIL, passwordHash, FULL_NAME]
    );
    console.log(`✅ Administrador creado: ${EMAIL}`);
    console.log(`   Ya puedes iniciar sesión con la contraseña que pusiste en PASSWORD.`);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      console.log(`⚠️  Ya existe un admin con ese correo. Si quieres reemplazarlo, bórralo primero:`);
      console.log(`   DELETE FROM admin_users WHERE email = '${EMAIL}';`);
    } else {
      console.error("❌ Error:", err.message);
    }
  } finally {
    await connection.end();
  }
}

main();