// =============================================================================
// server/middleware/validateSql.middleware.js
// Primera barrera: rechaza DML/DDL, múltiples sentencias, comentarios y
// funciones peligrosas. Si pasa, deja la consulta limpia en req.consultaValidada.
// La segunda barrera es el usuario read-only de MySQL en queryquest_sandbox.
// =============================================================================

const PROHIBIDAS =
  /\b(insert|update|delete|drop|alter|create|truncate|rename|grant|revoke|load_file|into\s+outfile|into\s+dumpfile|sleep|benchmark|information_schema|mysql\.|performance_schema)\b/i;

const COMENTARIOS = /(--|#|\/\*)/;

export function validarConsulta(req, res, next) {
  const { consulta } = req.body ?? {};

  if (typeof consulta !== 'string' || !consulta.trim()) {
    return res.status(400).json({
      estado: 'rechazado_seguridad',
      retroalimentacion: 'La consulta está vacía.',
    });
  }

  if (consulta.length > 5000) {
    return res.status(400).json({
      estado: 'rechazado_seguridad',
      retroalimentacion: 'La consulta supera el tamaño permitido.',
    });
  }

  const limpia = consulta.trim().replace(/;\s*$/, '');

  if (!/^select\b/i.test(limpia)) {
    return res.status(400).json({
      estado: 'rechazado_seguridad',
      retroalimentacion: 'Solo se permiten consultas SELECT.',
    });
  }

  if (limpia.includes(';')) {
    return res.status(400).json({
      estado: 'rechazado_seguridad',
      retroalimentacion: 'No se permiten múltiples sentencias.',
    });
  }

  if (COMENTARIOS.test(limpia)) {
    return res.status(400).json({
      estado: 'rechazado_seguridad',
      retroalimentacion: 'No se permiten comentarios SQL.',
    });
  }

  if (PROHIBIDAS.test(limpia)) {
    return res.status(400).json({
      estado: 'rechazado_seguridad',
      retroalimentacion: 'La consulta contiene una operación no permitida.',
    });
  }

  req.consultaValidada = limpia;
  next();
}