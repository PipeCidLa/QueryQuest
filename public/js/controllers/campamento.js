// Controla el mapa, abre misiones y actualiza el avance desde PHP.

import { $ } from '../utils/dom.js';
import { mostrarVista, abrirMapa } from '../views/navegacion.js';
import { renderMapa } from '../views/mapa.js';
import { renderHeader } from '../views/header.js';
import { pintarMisionEnPantalla } from '../views/mision.js';
import { MissionService } from '../services/MissionService.js';
import { ProgressService } from '../services/ProgressService.js';
import { registrarAbrirMision } from './entrada.js';

async function abrirMision(idMision) {
  try {
    const mision = await MissionService.abrir(idMision);
    pintarMisionEnPantalla(mision);
  } catch (e) {
    alert(e.message);
  }
}

export async function refrescarMapaYHeader() {
  try {
    await MissionService.cargarRegiones();
    await ProgressService.refrescar();
    renderHeader();
    renderMapa(abrirMision);
  } catch (error) {
    throw new Error(`No se pudo actualizar el avance: ${error.message}`);
  }
}

export function initCampamento() {
  registrarAbrirMision(abrirMision);

  $('volver-menu').onclick = () => mostrarVista('menu', 'titulo-menu');

  $('alternar-mapa').onclick = () => {
    const abrir = $('vista-mapa').hidden;
    abrirMapa(abrir);
    if (abrir) $('titulo-mapa').focus();
  };

  $('volver-mapa').onclick = async () => {
    try {
      await refrescarMapaYHeader();
      abrirMapa(true);
      mostrarVista('campamento', 'titulo-mapa');
    } catch (error) {
      alert(error.message);
    }
  };
}