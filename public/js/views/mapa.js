// =============================================================================
// public/js/views/mapa.js
// Dibuja las 3 regiones y sus misiones en #ruta-misiones a partir de
// estado.regiones (que llenó MissionService.cargarRegiones()).
// =============================================================================

import { ESTADOS_MISION } from '../config.js';
import { estado } from '../state/GameState.js';
import { $ } from '../utils/dom.js';

// Icono por nivel de región (coincide con regiones.nivel de la BD).
const ICONO_REGION = {
  inicial: '🏰',
  intermedio: '🌲',
  aplicacion: '🔮',
};

/**
 * Pinta el mapa completo.
 * @param {(idMision: number) => void} alSeleccionarMision
 *        Callback que el controlador pasa para abrir la misión elegida.
 */
export function renderMapa(alSeleccionarMision) {
  const contenedor = $('ruta-misiones');
  contenedor.replaceChildren();

  estado.regiones.forEach(region => {
    const grupo = document.createElement('div');
    grupo.className = 'grupo';

    const nivel = document.createElement('div');
    nivel.className = 'nivel';
    nivel.textContent = region.nivel;

    region.misiones.forEach(m => {
      const bloqueada = m.estadoUsuario === ESTADOS_MISION.BLOQUEADA;
      const completada = m.estadoUsuario === ESTADOS_MISION.COMPLETADA;

      const boton = document.createElement('button');
      boton.className = 'mision';
      boton.type = 'button';
      boton.disabled = bloqueada;
      boton.dataset.misionId = String(m.id);
      if (estado.misionActual?.id === m.id) {
        boton.setAttribute('aria-current', 'true');
      }

      const icono = document.createElement('span');
      icono.className = 'mapa-icono';
      icono.setAttribute('aria-hidden', 'true');
      icono.textContent = ICONO_REGION[region.nivel] ?? '◆';

      const estadoTexto = document.createElement('small');
      estadoTexto.textContent = completada
        ? 'Completada'
        : bloqueada
          ? 'Bloqueada'
          : 'Disponible';

      boton.append(icono, document.createTextNode(m.titulo), estadoTexto);
      boton.onclick = () => alSeleccionarMision(m.id);

      grupo.append(boton);
    });

    contenedor.append(nivel, grupo);
  });
}