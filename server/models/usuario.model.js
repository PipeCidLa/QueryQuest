// =============================================================================
// server/models/usuario.model.js
// Acceso a la tabla usuarios (creación, búsqueda por nombre, actualización de
// personaje). SQL parametrizado, nunca concatenado.
// =============================================================================

import { poolApp } from '../config/db.app.js';

export async function crearUsuario({ nombreUsuario, correo, passwordHash, nombreVisible, personaje }) {
  const [r] = await poolApp.query(
    `INSERT INTO usuarios (nombre_usuario, correo, password_hash, nombre_visible, personaje)
     VALUES (?, ?, ?, ?, ?)`,
    [nombreUsuario, correo, passwordHash, nombreVisible, personaje]
  );
  return r.insertId;
}

export async function buscarPorNombreUsuario(nombreUsuario) {
  const [rows] = await poolApp.query(
    `SELECT id_usuario, nombre_usuario, correo, password_hash, rol,
            nombre_visible, personaje, activo
       FROM usuarios WHERE nombre_usuario = ? LIMIT 1`,
    [nombreUsuario]
  );
  return rows[0] ?? null;
}

export async function actualizarPersonaje(idUsuario, personaje) {
  const [r] = await poolApp.query(
    `UPDATE usuarios SET personaje = ? WHERE id_usuario = ?`,
    [personaje, idUsuario]
  );
  return r.affectedRows > 0;
}

export async function buscarPorId(idUsuario) {
  const [rows] = await poolApp.query(
    `SELECT id_usuario, nombre_usuario, correo, rol, nombre_visible, personaje, activo
       FROM usuarios WHERE id_usuario = ? LIMIT 1`,
    [idUsuario]
  );
  return rows[0] ?? null;
}