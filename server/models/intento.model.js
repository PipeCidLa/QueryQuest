// =============================================================================
// server/models/intento.model.js
// Registra cada intento (académico o de error) en la tabla intentos.
// Recibe la conexión porque se usa dentro de la transacción de progress.service.
// =============================================================================

export async function registrarIntento(conn, { idUsuario, idVersion, consulta, estado, retro, tiempoMs }) {
  const [r] = await conn.query(
    `INSERT INTO intentos
       (id_usuario, id_version, consulta_sql, estado, retroalimentacion, tiempo_ms)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [idUsuario, idVersion, consulta, estado, retro, tiempoMs]
  );
  return r.insertId;
}