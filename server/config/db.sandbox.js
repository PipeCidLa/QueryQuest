// =============================================================================
// server/config/db.sandbox.js
// Pool MySQL hacia queryquest_sandbox (SOLO SELECT).
// El usuario de BD debe tener únicamente GRANT SELECT.
// =============================================================================

import mysql from 'mysql2/promise';
import { env } from './env.js';

export const poolSandbox = mysql.createPool({
  host: env.sandbox.host,
  port: env.sandbox.port,
  user: env.sandbox.user,
  password: env.sandbox.pass,
  database: env.sandbox.name,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  timezone: 'Z',
  charset: 'utf8mb4',
});