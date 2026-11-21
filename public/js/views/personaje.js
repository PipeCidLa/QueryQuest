// Muestra el personaje elegido en la entrada, la fogata, el mapa y la misión.

import { PERSONAJES } from '../config.js';
import { estado } from '../state/GameState.js';
import { $ } from '../utils/dom.js';

export function personajeActual() {
  return PERSONAJES[estado.personajeActual] ?? PERSONAJES[0];
}

export function aplicarPersonaje() {
  const { nombre, imagen } = personajeActual();

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