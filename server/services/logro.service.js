// =============================================================================
// server/services/logro.service.js
// Otorga el logro de una región cuando el usuario completa sus 10 misiones.
// Devuelve el logro otorgado (o null) para incluirlo en la respuesta del POST.
// =============================================================================

import { poolApp } from '../config/db.app.js';
import { contarCompletadasPorRegion } from '../models/progreso.model.js';
import { otorgarLogro } from '../models/logro.model.js';

export async function evaluarLogroDeRegion(conn, { idUsuario, idRegion }) {
  const completadas = await contarCompletadasPorRegion(idUsuario, idRegion);
  if (completadas < 10) return null;

  const [[logro]] = await poolApp.query(
    `SELECT id_logro, nombre, descripcion, icono
       FROM logros WHERE id_region = ? LIMIT 1`,
    [idRegion]
  );
  if (!logro) return null;

  const nuevo = await otorgarLogro(conn, { idUsuario, idLogro: logro.id_logro });
  return nuevo ? logro : null;
}