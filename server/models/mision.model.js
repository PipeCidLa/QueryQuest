// =============================================================================
// server/models/mision.model.js
// Devuelve la versión publicada vigente de una misión (la de mayor
// numero_version con estado_version = 'publicada'). Incluye la solución de
// referencia, que solo se usa en el servidor para comparar resultados.
// =============================================================================

import { poolApp } from '../config/db.app.js';

export async function obtenerMisionVigente(idMision) {
  const [rows] = await poolApp.query(
    `SELECT m.id_mision, m.numero_orden, m.titulo, m.xp_recompensa,
            r.nivel, r.nombre AS region_nombre,
            v.id_version, v.contexto_narrativo, v.consigna, v.pista,
            v.solucion_referencia, v.dataset_codigo
       FROM misiones m
       JOIN regiones r ON r.id_region = m.id_region
       JOIN versiones_mision v
         ON v.id_mision = m.id_mision AND v.estado_version = 'publicada'
      WHERE m.id_mision = ?
      ORDER BY v.numero_version DESC
      LIMIT 1`,
    [idMision]
  );
  return rows[0] ?? null;
}

export async function siguienteMisionDisponible(numeroOrden) {
  const [rows] = await poolApp.query(
    `SELECT id_mision FROM misiones
      WHERE numero_orden = ? AND estado = 'disponible' LIMIT 1`,
    [numeroOrden]
  );
  return rows[0] ?? null;
}