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
  seleccionarMisionActiva,
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
    const r = await MissionService.ejecutar(estado.misionActual.id, consulta);
    pintarResultado(r);
    pintarMensajeResultado(r);

    if (r.estado === 'correcto') {
      await refrescarMapaYHeader();
      const siguiente = buscarSiguienteMision(estado.misionActual.numeroOrden);
      mostrarBotonSiguiente(Boolean(siguiente) && siguiente.estadoUsuario !== 'bloqueada');
    } else {
      mostrarBotonSiguiente(false);
    }
  } catch (e) {
    mostrarMensaje(e.message, 'error');
  } finally {
    ejecutando = false;
  }
}

function buscarSiguienteMision(numeroOrden) {
  return estado.regiones
    .flatMap(r => r.misiones)
    .find(m => m.numeroOrden === numeroOrden + 1) ?? null;
}

async function siguienteMision() {
  const actual = estado.misionActual;
  if (!actual) return;
  const siguiente = buscarSiguienteMision(actual.numeroOrden);
  if (!siguiente || siguiente.estadoUsuario === 'bloqueada') return;
  const { pintarMisionEnPantalla } = await import('../views/mision.js');
  const mision = await MissionService.abrir(siguiente.id);
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