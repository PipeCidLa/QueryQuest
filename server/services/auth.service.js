// =============================================================================
// server/services/auth.service.js
// Registro con bcrypt y login. Devuelve el usuario sin password_hash.
// =============================================================================

import bcrypt from 'bcrypt';
import { crearUsuario, buscarPorNombreUsuario } from '../models/usuario.model.js';

export async function registrar({ nombre_usuario, correo, password, nombre_visible, personaje }) {
  const hash = await bcrypt.hash(password, 10);
  const id = await crearUsuario({
    nombreUsuario: nombre_usuario,
    correo,
    passwordHash: hash,
    nombreVisible: nombre_visible || nombre_usuario,
    personaje: personaje || 'aventurero',
  });
  return {
    id_usuario: id,
    nombre_usuario,
    nombre_visible: nombre_visible || nombre_usuario,
    personaje: personaje || 'aventurero',
    rol: 'estudiante',
  };
}

export async function login({ nombre_usuario, password }) {
  const u = await buscarPorNombreUsuario(nombre_usuario);
  if (!u || !u.activo) return null;

  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return null;

  const { password_hash, ...resto } = u;
  return resto;
}