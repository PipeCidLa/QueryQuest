// =============================================================================
// server/services/mission.service.js
// Orquesta la ejecución de una misión:
//   1. Trae versión vigente (y su solución de referencia)
//   2. Evalúa contra sandbox
//   3. En UNA transacción: registra intento, otorga progreso (si primera vez)
//      y evalúa logro de región
//   4. Devuelve al front el resultado + banderas de primera_vez / logro nuevo
// =============================================================================

import { poolApp } from '../config/db.app.js';
import { obtenerMisionVigente, siguienteMisionDisponible } from '../models/mision.model.js';
import { registrarIntento } from '../models/intento.model.js';
import { registrarProgresoSiPrimeraVez } from '../models/progreso.model.js';
import { evaluar } from './evaluator.service.js';
import { evaluarLogroDeRegion } from './logro.service.js';

export async function ejecutarMision({ idUsuario, idMision, consulta }) {
  const mision = await obtenerMisionVigente(idMision);
  if (!mision) {
    throw Object.assign(new Error('Misión no encontrada.'), { status: 404 });
  }

  const resultado = await evaluar({
    idVersion: mision.id_version,
    sqlReferencia: mision.solucion_referencia,
    consultaAlumno: consulta,
    ordenEstricto: false,
  });

  const conn = await poolApp.getConnection();
  let primeraVez = false;
  let logroNuevo = null;

  try {
    await conn.beginTransaction();

    await registrarIntento(conn, {
      idUsuario,
      idVersion: mision.id_version,
      consulta,
      estado: resultado.estado,
      retro: resultado.retroalimentacion,
      tiempoMs: resultado.tiempo_ms,
    });

    if (resultado.estado === 'correcto') {
      primeraVez = await registrarProgresoSiPrimeraVez(conn, {
        idUsuario,
        idMision,
        xp: mision.xp_recompensa,
      });

      const [[regionRow]] = await conn.query(
        `SELECT id_region FROM misiones WHERE id_mision = ?`,
        [idMision]
      );
      logroNuevo = await evaluarLogroDeRegion(conn, {
        idUsuario,
        idRegion: regionRow.id_region,
      });
    }

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }

  const siguiente = await siguienteMisionDisponible(mision.numero_orden + 1);

  const retro = resultado.retroalimentacion +
    (resultado.estado === 'correcto' && primeraVez
      ? ` +${mision.xp_recompensa} XP.`
      : '') +
    (logroNuevo ? ` ¡Logro desbloqueado: ${logroNuevo.nombre}!` : '');

  return {
    estado: resultado.estado,
    columnas: resultado.columnas,
    filas: resultado.filas,
    retroalimentacion: retro,
    tiempo_ms: resultado.tiempo_ms,
    xp_otorgado: primeraVez ? mision.xp_recompensa : 0,
    primera_vez: primeraVez,
    logro_nuevo: logroNuevo,
    hay_siguiente: Boolean(siguiente),
  };
}