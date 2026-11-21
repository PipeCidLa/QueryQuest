// Estado en memoria compartido por servicios, controladores y vistas.
// PHP determina los permisos, desbloqueos y puntos que se muestran aquí.

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