// =============================================================================
// server/middleware/auth.middleware.js
// Sesión con cookie firmada (HMAC-SHA256). Suficiente para demo universitaria.
// Guarda el usuario en req.usuario para los controladores protegidos.
// =============================================================================

import crypto from 'node:crypto';
import { env } from '../config/env.js';

const COOKIE = 'qq_session';

function firmar(valor) {
  return crypto.createHmac('sha256', env.sessionSecret).update(valor).digest('hex');
}

export function crearSesion(res, usuario) {
  const payload = Buffer.from(JSON.stringify(usuario)).toString('base64url');
  const firma = firmar(payload);
  res.cookie(COOKIE, `${payload}.${firma}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: 1000 * 60 * 60 * 12,
  });
}

export function requerirAuth(req, res, next) {
  const raw = req.cookies?.[COOKIE];
  if (!raw) return res.status(401).json({ error: 'No autenticado' });

  const [payload, firma] = raw.split('.');
  if (!payload || !firma || firma !== firmar(payload)) {
    return res.status(401).json({ error: 'Sesión inválida' });
  }

  try {
    req.usuario = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return res.status(401).json({ error: 'Sesión corrupta' });
  }
  next();
}