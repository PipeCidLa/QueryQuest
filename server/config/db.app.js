// =============================================================================
// server/config/db.app.js
// Pool MySQL hacia queryquest_app (lectura/escritura).
// Lo usan los modelos y progress.service. Nunca ejecuta SQL del alumno.
// =============================================================================

import mysql from 'mysql2/promise';
import { env } from './env.js';

export const poolApp = mysql.createPool({
  host: env.app.host,
  port: env.app.port,
  user: env.app.user,
  password: env.app.pass,
  database: env.app.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  timezone: 'Z',
  charset: 'utf8mb4',
});