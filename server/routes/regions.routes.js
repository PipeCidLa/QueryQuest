// =============================================================================
// server/routes/regions.routes.js
// Regiones + misiones del usuario (requiere sesión).
// =============================================================================

import { Router } from 'express';
import { getRegiones } from '../controllers/regions.controller.js';

export const regionsRouter = Router().get('/', getRegiones);