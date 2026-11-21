// Cambia de pantalla, mueve el foco y abre o cierra el mapa.

import { vistas, vistasEntrada } from '../config.js';
import { $, enfocar } from '../utils/dom.js';

export function mostrarVista(vista, idTitulo) {
  document.body.classList.toggle('en-campamento', vista === 'campamento');
  const esEntrada = vistasEntrada.includes(vista);
  $('cabecera').hidden = esEntrada;
  $('estadisticas-cabecera').hidden = esEntrada;
  vistas.forEach(nombre => { $('vista-' + nombre).hidden = nombre !== vista; });
  enfocar(idTitulo);
  document.dispatchEvent(new Event('queryquest:vista'));
}

export function abrirMapa(abierto) {
  $('vista-mapa').hidden = !abierto;
  $('alternar-mapa').setAttribute('aria-expanded', String(abierto));
  $('alternar-mapa').textContent = abierto ? '◈ Ocultar mapa' : '◈ Abrir mapa';
  document.dispatchEvent(new Event('queryquest:vista'));
}