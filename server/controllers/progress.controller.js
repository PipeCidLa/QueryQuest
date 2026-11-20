// =============================================================================
// server/controllers/progress.controller.js
// GET /api/progreso → XP, misiones completadas, logros del usuario autenticado.
// =============================================================================

import { obtenerProgresoUsuario } from '../services/progress.service.js';

export async function getProgreso(req, res, next) {
  try {
    res.json(await obtenerProgresoUsuario(req.usuario.id_usuario));
  } catch (e) {
    next(e);
  }
}