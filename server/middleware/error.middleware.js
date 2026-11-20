// =============================================================================
// server/middleware/error.middleware.js
// Manejador final de errores. Los errores >= 500 se loguean; los 4xx se
// devuelven tal cual con el estado semántico que el front espera.
// =============================================================================

export function manejadorErrores(err, _req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) console.error('[QueryQuest]', err);

  res.status(status).json({
    estado: err.estado || (status >= 500 ? 'error_evaluador' : 'incorrecto'),
    retroalimentacion: err.message || 'Error interno del servidor.',
  });
}