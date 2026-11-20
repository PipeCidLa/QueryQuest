// =============================================================================
// server/models/logro.model.js
// Inserta un logro al usuario de forma idempotente y devuelve si era nuevo.
// =============================================================================

export async function otorgarLogro(conn, { idUsuario, idLogro }) {
  const [r] = await conn.query(
    `INSERT INTO usuario_logros (id_usuario, id_logro)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE id_usuario_logro = id_usuario_logro`,
    [idUsuario, idLogro]
  );
  return r.affectedRows === 1;
}