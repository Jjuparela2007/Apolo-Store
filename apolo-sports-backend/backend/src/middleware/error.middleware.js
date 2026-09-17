function errorHandler(err, req, res, next) {
  console.error(err);

  // Errores de multer (archivo muy grande, tipo no permitido) llegan aquí también
  if (err.name === "MulterError" || /Formato no permitido/.test(err.message)) {
    return res.status(400).json({ error: err.message });
  }

  const status = err.status || 500;
  const message = err.status ? err.message : "Error interno del servidor";

  const body = { error: message };
  // Algunos errores (como PHONE_REQUIRED) traen un code para que el frontend
  // pueda reaccionar distinto sin tener que parsear el texto del mensaje.
  if (err.code) body.code = err.code;

  res.status(status).json(body);
}

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

module.exports = { errorHandler, asyncHandler };