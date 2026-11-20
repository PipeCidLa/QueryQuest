// =============================================================================
// server/controllers/missions.controller.js
// GET  /api/misiones/:id           → versión vigente sin solución de referencia
// POST /api/misiones/:id/ejecutar  → evalúa la consulta del alumno
// =============================================================================

import { obtenerMisionVigente } from '../models/mision.model.js';
import { ejecutarMision } from '../services/mission.service.js';

export async function getMision(req, res, next) {
  try {
    const m = await obtenerMisionVigente(Number(req.params.id));
    if (!m) return res.status(404).json({ error: 'Misión no encontrada.' });

    res.json({
      id_mision: m.id_mision,
      id_version: m.id_version,
      titulo: m.titulo,
      numero_orden: m.numero_orden,
      nivel: m.nivel,
      region_nombre: m.region_nombre,
      contexto_narrativo: m.contexto_narrativo,
      consigna: m.consigna,
      pista: m.pista,
      dataset_codigo: m.dataset_codigo,
      xp_recompensa: m.xp_recompensa,
      // solucion_referencia NO se expone
    });
  } catch (e) {
    next(e);
  }
}

export async function postEjecutar(req, res, next) {
  try {
    const resultado = await ejecutarMision({
      idUsuario: req.usuario.id_usuario,
      idMision: Number(req.params.id),
      consulta: req.consultaValidada,
    });
    res.json(resultado);
  } catch (e) {
    next(e);
  }
}