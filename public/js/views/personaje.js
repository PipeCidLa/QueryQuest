// personaje.js — Pinta el sprite y nombre del personaje en toda la UI.
// Qué hace: sincroniza los <img> y textos del personaje en pantalla de elección,
//           campamento, mapa y misión a partir de PERSONAJES y GameState.
// Qué NO hace: no decide qué personaje está activo (eso es controllers/entrada.js).

import { PERSONAJES } from '../config.js';
import { estado } from '../state/GameState.js';
import { $ } from '../utils/dom.js';

export function aplicarPersonaje() {
  const { nombre, imagen } = PERSONAJES[estado.personajeActual] ?? PERSONAJES[0];

  ['imagen-previa', 'icono-campamento', 'icono-mapa', 'icono-mision']
    .forEach(id => { $(id).src = imagen; });
  ['nombre-personaje', 'personaje-campamento', 'personaje-mapa']
    .forEach(id => { $(id).textContent = nombre; });
}

export function aplicarPersonajePorCodigo(codigo) {
  const idx = PERSONAJES.findIndex(p => p.codigo === codigo);
  if (idx >= 0) estado.personajeActual = idx;
  aplicarPersonaje();
}