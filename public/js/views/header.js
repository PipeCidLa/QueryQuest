// header.js — Cabecera y panel de datos del campamento.
// pinta XP, contador de misiones, nivel y nombre del jugador
// a partir de GameState.progreso (Player).


import { estado } from '../state/GameState.js';
import { $ } from '../utils/dom.js';

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

  const siguiente = estado.regiones
    .flatMap(r => r.misiones)
    .find(m => m.estado_usuario === 'disponible');
  $('proxima-aventura').textContent = siguiente
    ? siguiente.titulo
    : hechas >= 30 ? 'Has completado la aventura.' : 'No hay misiones disponibles.';
  $('bienvenida').textContent = `Bienvenido a tu campamento, ${nombre}.`;
}
