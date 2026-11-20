// =============================================================================
// server/controllers/usuarios.controller.js
// PATCH /api/usuarios/me → actualiza el personaje elegido por el usuario.
// =============================================================================

import { actualizarPersonaje, buscarPorId } from '../models/usuario.model.js';

const PERSONAJES_VALIDOS = new Set(['aventurero', 'aventurera']);

export async function patchMe(req, res, next) {
  try {
    const { personaje } = req.body ?? {};
    if (!PERSONAJES_VALIDOS.has(personaje)) {
      return res.status(400).json({ error: 'Personaje inválido.' });
    }
    await actualizarPersonaje(req.usuario.id_usuario, personaje);
    const actualizado = await buscarPorId(req.usuario.id_usuario);
    res.json({ usuario: actualizado });
  } catch (e) {
    next(e);
  }
}