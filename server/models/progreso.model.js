// =============================================================================
// server/models/progreso.model.js
// Progreso agregado del usuario + inserción idempotente de progreso de misión.
// El truco ON DUPLICATE KEY UPDATE id_progreso = id_progreso deja la fila
// intacta y permite saber si fue "primera vez" por affectedRows.
// =============================================================================

import { poolApp } from '../config/db.app.js';

export async function obtenerProgresoUsuario(idUsuario) {
  const [[usuario]] = await poolApp.query(
    `SELECT id_usuario, nombre_visible, personaje
       FROM usuarios WHERE id_usuario = ?`,
    [idUsuario]
  );

  const [[totales]] = await poolApp.query(
    `SELECT COUNT(*) AS total_misiones FROM misiones WHERE estado = 'disponible'`
  );

  const [[hechas]] = await poolApp.query(
    `SELECT COUNT(*) AS completadas, COALESCE(SUM(xp_otorgado), 0) AS xp
       FROM progreso_misiones
      WHERE id_usuario = ? AND completada = 1`,
    [idUsuario]
  );

  const [logros] = await poolApp.query(
    `SELECT l.nombre, l.descripcion, l.icono, ul.otorgado_en
       FROM usuario_logros ul
       JOIN logros l ON l.id_logro = ul.id_logro
      WHERE ul.id_usuario = ?`,
    [idUsuario]
  );

  return {
    usuario,
    xp_total: Number(hechas.xp),
    misiones_completadas: Number(hechas.completadas),
    total_misiones: Number(totales.total_misiones),
    logros,
  };
}

export async function registrarProgresoSiPrimeraVez(conn, { idUsuario, idMision, xp }) {
  const [r] = await conn.query(
    `INSERT INTO progreso_misiones
       (id_usuario, id_mision, completada, xp_otorgado, completada_en)
     VALUES (?, ?, TRUE, ?, NOW())
     ON DUPLICATE KEY UPDATE id_progreso = id_progreso`,
    [idUsuario, idMision, xp]
  );
  return r.affectedRows === 1;
}

export async function contarCompletadasPorRegion(idUsuario, idRegion) {
  const [[r]] = await poolApp.query(
    `SELECT COUNT(*) AS completadas
       FROM progreso_misiones p
       JOIN misiones m ON m.id_mision = p.id_mision
      WHERE p.id_usuario = ? AND p.completada = 1 AND m.id_region = ?`,
    [idUsuario, idRegion]
  );
  return Number(r.completadas);
}