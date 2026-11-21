// Envía la consulta a PHP y gestiona el resultado y el paso a otra misión.

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
import { mostrarCierreRegion } from '../views/cierre_region.js';
import { refrescarMapaYHeader } from './campamento.js';

let ejecutando = false;

async function ejecutarConsulta() {
  if (ejecutando) return;
  const consulta = $('sql').value;
  if (!consulta.trim()) {
    $('panel-resultado').hidden = false;
    $('resultado').replaceChildren();
    mostrarMensaje('Escribe una consulta primero.', 'error');
    $('siguiente').hidden = true;
    $('sql').focus();
    return;
  }
  if (!estado.misionActual) return;

  ejecutando = true;
  $('ejecutar').disabled = true;
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
      mostrarCierreRegion(r);
    } else {
      mostrarBotonSiguiente(false);
    }
  } catch (e) {
    mostrarMensaje(e.message, 'error');
  } finally {
    ejecutando = false;
    $('ejecutar').disabled = false;
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
  try {
    const mision = await MissionService.abrir(siguiente.id_mision);
    pintarMisionEnPantalla(mision);
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
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
