// navegacion.js — Cambio de vista y apertura/cierre del mapa.
// muestra la sección correcta, alterna cabecera, mueve el foco.


import { vistas, vistasEntrada } from '../config.js';
import { $, enfocar } from '../utils/dom.js';

export function mostrarVista(vista, idTitulo) {
  const esEntrada = vistasEntrada.includes(vista);
  $('cabecera').hidden = esEntrada;
  $('estadisticas-cabecera').hidden = esEntrada;
  vistas.forEach(nombre => { $('vista-' + nombre).hidden = nombre !== vista; });
  enfocar(idTitulo);
}

export function abrirMapa(abierto) {
  $('vista-mapa').hidden = !abierto;
  $('alternar-mapa').setAttribute('aria-expanded', String(abierto));
  $('alternar-mapa').textContent = abierto ? '◈ Ocultar mapa' : '◈ Abrir mapa';
}