// =============================================================================
// public/js/main.js
// Bootstrap del front. Único punto de composición: inicializa controladores.
// No hay datos hardcodeados: al autenticar se piden regiones y progreso.
// =============================================================================

import { aplicarPersonaje } from './views/personaje.js';
import { initEntrada } from './controllers/entrada.js';
import { initCampamento } from './controllers/campamento.js';
import { initMision } from './controllers/mision.js';

aplicarPersonaje();

initEntrada();
initCampamento();
initMision();