// =============================================================================
// server/models/region.model.js
// Devuelve las regiones con sus misiones y calcula estado_usuario por usuario:
//   - completada: existe fila completada en progreso_misiones
//   - disponible: es la primera de su región o la anterior está completada
//   - bloqueada:  resto
// =============================================================================

import { poolApp } from '../config/db.app.js';

export async function listarRegionesConMisiones(idUsuario) {
  const [regiones] = await poolApp.query(
    `SELECT id_region, codigo, nombre, nivel, orden, descripcion
       FROM regiones ORDER BY orden`
  );

  const [misiones] = await poolApp.query(
    `SELECT m.id_mision, m.id_region, m.numero_orden, m.titulo, m.xp_recompensa,
            COALESCE(p.completada, 0) AS completada
       FROM misiones m
       LEFT JOIN progreso_misiones p
         ON p.id_mision = m.id_mision AND p.id_usuario = ?
      WHERE m.estado = 'disponible'
      ORDER BY m.numero_orden`,
    [idUsuario]
  );

  return regiones.map(r => {
    const deRegion = misiones.filter(m => m.id_region === r.id_region);
    return {
      ...r,
      misiones: deRegion.map((m, i) => {
        const previa = deRegion[i - 1];
        const desbloqueada = i === 0 || Boolean(previa?.completada);
        return {
          id_mision: m.id_mision,
          numero_orden: m.numero_orden,
          titulo: m.titulo,
          xp_recompensa: m.xp_recompensa,
          completada: Boolean(m.completada),
          estado_usuario: m.completada
            ? 'completada'
            : desbloqueada
              ? 'disponible'
              : 'bloqueada',
        };
      }),
    };
  });
}