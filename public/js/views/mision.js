// =============================================================================
// public/js/views/mision.js
// Pinta la pantalla de misión: contexto, consigna, pista, resultado.
// Los nombres de campo vienen del modelo Mission (contexto_narrativo, consigna).
// =============================================================================

import { estado } from '../state/GameState.js';
import { $, crearTabla, mostrarMensaje, reiniciarResultado } from '../utils/dom.js';
import { mostrarVista } from './navegacion.js';

export function pintarMisionEnPantalla(mision) {
  $('etapa').textContent = `${mision.nivel} · Misión ${String(mision.numero_orden).padStart(2, '0')}`;
  $('titulo-mision').textContent = 'Misión: ' + mision.titulo;
  $('historia').textContent = mision.contexto_narrativo;
  $('objetivo').textContent = mision.consigna;
  $('sql').value = '';

  $('texto-pista').textContent = mision.pista;
  $('texto-pista').hidden = true;
  $('pista').textContent = 'Ver pista';
  $('pista').setAttribute('aria-expanded', 'false');

  reiniciarResultado();
  mostrarVista('mision', 'titulo-mision');
}

export function pintarResultado(resultado) {
  if (!resultado.columnas.length) {
    $('resultado').replaceChildren();
    return;
  }
  $('resultado').append(crearTabla(resultado.columnas, resultado.filas));
}

export function pintarMensajeResultado(resultado) {
  const ok = resultado.estado === 'correcto';
  mostrarMensaje(resultado.retroalimentacion, ok ? 'ok' : 'error');
}

export function alternarPistaUI() {
  const texto = $('texto-pista');
  texto.hidden = !texto.hidden;
  $('pista').textContent = texto.hidden ? 'Ver pista' : 'Ocultar pista';
  $('pista').setAttribute('aria-expanded', String(!texto.hidden));
}

export function limpiarEditorUI() {
  $('sql').value = '';
  reiniciarResultado();
  $('sql').focus();
}

export function mostrarBotonSiguiente(visible) {
  $('siguiente').hidden = !visible;
}

export function seleccionarMisionActiva(id) {
  return estado.regiones
    .flatMap(r => r.misiones)
    .find(m => m.id_mision === id) ?? null;
}