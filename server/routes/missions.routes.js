// =============================================================================
// server/routes/missions.routes.js
// Abrir misión y ejecutar consulta (con validación previa de SQL).
// =============================================================================

import { Router } from 'express';
import { getMision, postEjecutar } from '../controllers/missions.controller.js';
import { validarConsulta } from '../middleware/validateSql.middleware.js';

export const missionsRouter = Router()
  .get('/:id', getMision)
  .post('/:id/ejecutar', validarConsulta, postEjecutar);