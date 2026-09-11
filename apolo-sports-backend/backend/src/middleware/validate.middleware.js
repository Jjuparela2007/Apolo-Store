// Validaciones simples y explícitas — sin librería externa, para mantener el proyecto liviano.
// Cada función lanza un error con status 400 si la validación falla.

function requireFields(body, fields) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === "");
  if (missing.length) {
    const err = new Error(`Faltan campos requeridos: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateEmail(email) {
  if (!isValidEmail(email)) {
    const err = new Error("El correo electrónico no es válido.");
    err.status = 400;
    throw err;
  }
}

// Contraseña segura: mínimo 8 caracteres, al menos una letra y un número.
function validatePasswordStrength(password) {
  if (!password || password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    const err = new Error("La contraseña debe tener al menos 8 caracteres, con letras y números.");
    err.status = 400;
    throw err;
  }
}

module.exports = { requireFields, isValidEmail, validateEmail, validatePasswordStrength };
