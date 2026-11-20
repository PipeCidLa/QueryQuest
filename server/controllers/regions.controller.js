// =============================================================================
// server/controllers/regions.controller.js
// GET /api/regiones → regiones + misiones con estado_usuario por usuario.
// =============================================================================

import { listarRegionesConMisiones } from '../models/region.model.js';

export async function getRegiones(req, res, next) {
  try {
    const regiones = await listarRegionesConMisiones(req.usuario.id_usuario);
    res.json(regiones);
  } catch (e) {
    next(e);
  }
}