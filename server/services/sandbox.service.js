// =============================================================================
// server/services/sandbox.service.js
// Ejecuta una consulta en queryquest_sandbox con timeout y clasifica el error.
// Devuelve siempre un objeto { ok, filas | estado, mensaje, tiempo_ms }.
// =============================================================================

import { poolSandbox } from '../config/db.sandbox.js';
import { env } from '../config/env.js';

function clasificarError(e) {
  if (e.code === 'ER_PARSE_ERROR' || e.code === 'ER_BAD_FIELD_ERROR' || e.code === 'ER_NO_SUCH_TABLE') {
    return 'error_sintaxis';
  }
  if (e.code === 'PROTOCOL_SEQUENCE_TIMEOUT' || /timeout/i.test(e.message)) {
    return 'timeout';
  }
  return 'error_evaluador';
}

export async function ejecutarEnSandbox(consulta) {
  const inicio = Date.now();
  const conn = await poolSandbox.getConnection();
  try {
    await conn.query({ sql: `SET SESSION MAX_EXECUTION_TIME = ${env.sqlTimeoutMs}` });
    const [filas] = await conn.query({ sql: consulta, timeout: env.sqlTimeoutMs });
    return { ok: true, filas, tiempo_ms: Date.now() - inicio };
  } catch (e) {
    return {
      ok: false,
      estado: clasificarError(e),
      mensaje: e.message,
      tiempo_ms: Date.now() - inicio,
    };
  } finally {
    conn.release();
  }
}