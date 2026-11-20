// =============================================================================
// server/controllers/auth.controller.js
// Registro, login y logout. Delgado: valida forma del body, llama al servicio,
// crea cookie de sesión y responde.
// =============================================================================

import { registrar, login } from '../services/auth.service.js';
import { crearSesion } from '../middleware/auth.middleware.js';

export async function postRegistro(req, res, next) {
  try {
    const { nombre_usuario, correo, password, nombre_visible, personaje } = req.body ?? {};
    if (!nombre_usuario || !correo || !password || password.length < 6) {
      return res.status(400).json({ error: 'Datos incompletos o contraseña corta.' });
    }
    const usuario = await registrar({ nombre_usuario, correo, password, nombre_visible, personaje });
    crearSesion(res, usuario);
    res.status(201).json({ usuario });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El usuario o correo ya existe.' });
    }
    next(e);
  }
}

export async function postLogin(req, res, next) {
  try {
    const { nombre_usuario, password } = req.body ?? {};
    if (!nombre_usuario || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son obligatorios.' });
    }
    const usuario = await login({ nombre_usuario, password });
    if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas.' });
    crearSesion(res, usuario);
    res.json({ usuario });
  } catch (e) {
    next(e);
  }
}

export function postLogout(_req, res) {
  res.clearCookie('qq_session');
  res.json({ ok: true });
}