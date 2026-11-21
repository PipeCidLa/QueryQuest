// Inicia los controles de la interfaz y restaura la sesión desde PHP.

import { iniciarMovimiento } from './views/movimiento.js';
import { iniciarPanelLogros } from './views/logros.js';
import { iniciarCierreRegion } from './views/cierre_region.js';
import { aplicarPersonaje } from './views/personaje.js';
import { initEntrada, restaurarEntrada } from './controllers/entrada.js';
import { initCampamento } from './controllers/campamento.js';
import { initMision } from './controllers/mision.js';

aplicarPersonaje();

initEntrada();
initCampamento();
initMision();
iniciarPanelLogros();
iniciarCierreRegion();
iniciarMovimiento();
restaurarEntrada();