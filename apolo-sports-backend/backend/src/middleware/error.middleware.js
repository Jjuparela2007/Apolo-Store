function errorHandler(err, req, res, next) {
  console.error(err);

  // Errores de multer (archivo muy grande, tipo no permitido) llegan aquí también
  if (err.name === "MulterError" || /Formato no permitido/.test(err.message)) {
    return res.status(400).json({ error: err.message });
  }

  const status = err.status || 500;
  const message = err.status ? err.message : "Error interno del servidor";
  res.status(status).json({ error: message });
}

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

module.exports = { errorHandler, asyncHandler };
