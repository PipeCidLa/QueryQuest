// =============================================================================
// server/routes/auth.routes.js
// Rutas públicas de autenticación.
// =============================================================================

import { Router } from 'express';
import { postRegistro, postLogin, postLogout } from '../controllers/auth.controller.js';

export const authRouter = Router()
  .post('/registro', postRegistro)
  .post('/login', postLogin)
  .post('/logout', postLogout);