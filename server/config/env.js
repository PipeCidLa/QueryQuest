// =============================================================================
// server/config/env.js
// Carga .env y valida que existan las variables críticas. Falla al arrancar si
// falta algo, en lugar de fallar en la primera consulta.
// =============================================================================

import 'dotenv/config';

function req(nombre) {
  const v = process.env[nombre];
  if (!v) throw new Error(`Falta variable de entorno: ${nombre}`);
  return v;
}

export const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  app: {
    host: req('DB_APP_HOST'),
    port: Number(process.env.DB_APP_PORT || 3306),
    user: req('DB_APP_USER'),
    pass: req('DB_APP_PASS'),
    name: req('DB_APP_NAME'),
  },
  sandbox: {
    host: req('DB_SANDBOX_HOST'),
    port: Number(process.env.DB_SANDBOX_PORT || 3306),
    user: req('DB_SANDBOX_USER'),
    pass: req('DB_SANDBOX_PASS'),
    name: req('DB_SANDBOX_NAME'),
  },
  sessionSecret: req('SESSION_SECRET'),
  sqlTimeoutMs: Number(process.env.SQL_TIMEOUT_MS || 2500),
  rateLimitEjecutar: Number(process.env.RATE_LIMIT_EJECUTAR || 20),
};