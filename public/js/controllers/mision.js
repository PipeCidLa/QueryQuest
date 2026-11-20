// =============================================================================
// public/js/controllers/mision.js
// Ejecuta la consulta contra la API, pinta el resultado y gestiona el paso
// a la siguiente misión. Toda la validación SQL ocurre en el backend.
// =============================================================================

import { estado } from '../state/GameState.js';
import { $, mostrarMensaje } from '../utils/dom.js';
import { MissionService } from '../services/MissionService.js';
import {
  pintarResultado,
  pintarMensajeResultado,
  alternarPistaUI,
  limpiarEditorUI,
  mostrarBotonSiguiente,
} from '../views/mision.js';
import { refrescarMapaYHeader } from './campamento.js';

let ejecutando = false;

async function ejecutarConsulta() {
  if (ejecutando) return;
  const consulta = $('sql').value;
  if (!consulta.trim()) {
    mostrarMensaje('Escribe una consulta primero.', 'error');
    $('sql').focus();
    return;
  }
  if (!estado.misionActual) return;

  ejecutando = true;
  $('panel-resultado').hidden = false;
  $('siguiente').hidden = true;
  $('resultado').replaceChildren();
  mostrarMensaje('Ejecutando…');

  try {
    const r = await MissionService.ejecutar(consulta);
    pintarResultado(r);
    pintarMensajeResultado(r);

    if (r.estado === 'correcto') {
      await refrescarMapaYHeader();
      const siguiente = buscarSiguienteMision(estado.misionActual.numero_orden);
      mostrarBotonSiguiente(Boolean(siguiente) && siguiente.estado_usuario !== 'bloqueada');
    } else {
      mostrarBotonSiguiente(false);
    }
  } catch (e) {
    mostrarMensaje(e.message, 'error');
  } finally {
    ejecutando = false;
  }
}

function buscarSiguienteMision(numero_orden) {
  return estado.regiones
    .flatMap(r => r.misiones)
    .find(m => m.numero_orden === numero_orden + 1) ?? null;
}

async function siguienteMision() {
  const actual = estado.misionActual;
  if (!actual) return;
  const siguiente = buscarSiguienteMision(actual.numero_orden);
  if (!siguiente || siguiente.estado_usuario === 'bloqueada') return;
  const { pintarMisionEnPantalla } = await import('../views/mision.js');
  const mision = await MissionService.abrir(siguiente.id_mision);
  pintarMisionEnPantalla(mision);
}

export function initMision() {
  $('ejecutar').onclick = ejecutarConsulta;
  $('limpiar').onclick = limpiarEditorUI;
  $('pista').onclick = alternarPistaUI;
  $('siguiente').onclick = siguienteMision;

  $('sql').addEventListener('keydown', evento => {
    if ((evento.ctrlKey || evento.metaKey) && evento.key === 'Enter') {
      evento.preventDefault();
      ejecutarConsulta();
    }
  });
}