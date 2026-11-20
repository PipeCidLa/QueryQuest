// GameState.js — Estado de sesión del jugador en el navegador.
// Qué hace: guarda en memoria el usuario autenticado, las regiones/misiones cargadas
//           y la misión abierta actualmente. Es la única fuente de verdad del front.
// Qué NO hace: no decide desbloqueos (lo hace el backend en GET /api/regiones),
//              no calcula XP (viene en GET /api/progreso), no toca el DOM.
// Quién lo usa: servicios y controladores. Las vistas reciben datos, no leen el estado.

export const estado = {
  usuario: null,          // { id_usuario, nombre_visible, personaje, rol }
  regiones: [],           // Region[] tal como las devuelve GET /api/regiones
  progreso: null,         // { xp_total, misiones_completadas, total_misiones, logros[] }
  misionActual: null,     // Misión abierta (GET /api/misiones/:id)
  siguienteMisionId: null,// Id de la siguiente misión desbloqueada, si la hay
  personajeActual: 0,     // índice en PERSONAJES (solo pantalla de elección)
};

export function resetEstadoSesion() {
  estado.usuario = null;
  estado.regiones = [];
  estado.progreso = null;
  estado.misionActual = null;
  estado.siguienteMisionId = null;
}