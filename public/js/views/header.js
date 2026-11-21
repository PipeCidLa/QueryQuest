// Actualiza el nombre, las estadísticas y el destino mostrado en el campamento.

import { estado } from '../state/GameState.js';
import { $ } from '../utils/dom.js';
import { renderLogros } from './logros.js';

export function renderHeader() {
  const p = estado.progreso;
  const nombre = p?.nombre_visible ?? estado.usuario?.nombre_visible ?? 'Estudiante';
  const xp = p?.xp_total ?? 0;
  const hechas = p?.misiones_completadas ?? 0;
  const total = p?.total_misiones ?? 30;

  $('jugador-cabecera').textContent = nombre;
  $('jugador-mapa').textContent = nombre;
  $('jugador-campamento').textContent = nombre;

  $('xp').textContent = `${xp} XP`;
  $('contador').textContent = `${hechas} / ${total} misiones`;

  $('nivel-campamento').textContent = p?.nivelActual ?? 'Inicial';
  $('xp-campamento').textContent = `${xp} XP`;
  $('misiones-campamento').textContent = `${hechas} / ${total}`;

  const progresoEl = $('progreso');
  progresoEl.max = total;
  progresoEl.value = hechas;

  $('progreso-campamento').max = total;
  $('progreso-campamento').value = hechas;
  $('porcentaje-campamento').textContent = `${total > 0 ? Math.round(hechas / total * 100) : 0} %`;

  const siguiente = estado.regiones
    .flatMap(r => r.misiones)
    .find(m => m.estado_usuario === 'disponible');
  // La ruta puede estar desbloqueada aunque aún no tenga misiones publicadas.
  const siguienteRegion = estado.regiones.find(r => r.misiones.includes(siguiente));
  const faseTerminada = hechas >= 10 && !siguiente;
  $('destino-aventura').textContent = siguienteRegion?.nombre
    ?? (hechas >= total ? 'Aventura completada' : faseTerminada ? 'Rumbo al almacén del paso' : 'El archivo de Tabularia');
  $('proxima-aventura').textContent = siguiente
    ? `Próxima misión: ${siguiente.titulo}`
    : hechas >= total ? 'Has recuperado el cauce de Tabularia. Puedes volver a practicar las misiones.'
      : faseTerminada ? 'El informe de Mara está listo. La expedición continúa hacia el almacén de Elia.'
        : 'Explora el mapa para comenzar tu aventura.';
  $('estado-aventura').hidden = !faseTerminada || hechas >= total;
  $('estado-aventura').textContent = 'Las próximas misiones todavía no están disponibles. Puedes repetir las del archivo.';
  $('bienvenida').textContent = `Bienvenido a tu campamento, ${nombre}.`;
  renderLogros(p);
}
