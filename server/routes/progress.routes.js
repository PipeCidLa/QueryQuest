// =============================================================================
// server/routes/progress.routes.js
// Progreso agregado del usuario.
// =============================================================================

import { Router } from 'express';
import { getProgreso } from '../controllers/progress.controller.js';

export const progressRouter = Router().get('/', getProgreso);