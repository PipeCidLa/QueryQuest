// =============================================================================
// server/routes/usuarios.routes.js
// Datos del propio usuario (por ahora solo cambiar personaje).
// =============================================================================

import { Router } from 'express';
import { patchMe } from '../controllers/usuarios.controller.js';

export const usuariosRouter = Router().patch('/me', patchMe);