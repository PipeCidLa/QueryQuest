// =============================================================================
// server/routes/index.js
// Monta /api/* y aplica requerirAuth a todo lo que no sea auth.
// =============================================================================

import { Router } from 'express';
import { requerirAuth } from '../middleware/auth.middleware.js';
import { authRouter } from './auth.routes.js';
import { regionsRouter } from './regions.routes.js';
import { missionsRouter } from './missions.routes.js';
import { progressRouter } from './progress.routes.js';
import { usuariosRouter } from './usuarios.routes.js';

export const apiRouter = Router()
  .use('/auth', authRouter)
  .use('/regiones', requerirAuth, regionsRouter)
  .use('/misiones', requerirAuth, missionsRouter)
  .use('/progreso', requerirAuth, progressRouter)
  .use('/usuarios', requerirAuth, usuariosRouter);