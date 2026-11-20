// =============================================================================
// server/app.js
// Arranque de Express: middlewares globales, estáticos de public/, rutas /api,
// rate limit solo en POST de ejecución, manejador de errores y listen.
// =============================================================================

import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { manejadorErrores } from './middleware/error.middleware.js';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.use(express.static('public'));

const limiteEjecucion = rateLimit({
  windowMs: 60_000,
  max: env.rateLimitEjecutar,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    estado: 'rechazado_seguridad',
    retroalimentacion: 'Demasiados intentos. Espera un momento antes de reintentar.',
  },
});

app.use('/api/misiones', (req, res, next) =>
  req.method === 'POST' ? limiteEjecucion(req, res, next) : next()
);

app.use('/api', apiRouter);
app.use(manejadorErrores);

app.listen(env.port, () => {
  console.log(`QueryQuest en http://localhost:${env.port} (${env.nodeEnv})`);
});