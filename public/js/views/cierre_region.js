import { $ } from '../utils/dom.js';
import { estado } from '../state/GameState.js';
import { mostrarVista, abrirMapa } from './navegacion.js';

export function iniciarCierreRegion() {
  $('cerrar-cierre').onclick = () => $('cierre-region').close();
  $('cierre-campamento').onclick = () => {
    $('cierre-region').close();
    $('panel-logros').open = true;
    abrirMapa(false);
    mostrarVista('campamento', 'titulo-logros');
    $('panel-logros').scrollIntoView({ block: 'nearest' });
  };
  $('cierre-continuar').onclick = () => {
    $('cierre-region').close();
    abrirMapa(true);
    mostrarVista('campamento', 'titulo-mapa');
  };
}

export function mostrarCierreRegion(resultado) {
  if (!resultado.logro_nuevo) return;
  $('cierre-titulo').textContent = resultado.logro_nuevo.nombre;
  $('cierre-historia').textContent = 'Mara revisa la lista y cierra el códice. Ya están identificadas las personas que pueden reconocer la marca de la piedra. Antes de subir a Vetatabla, queda revisar las provisiones con Elia en el almacén del paso.';
  $('cierre-resumen').textContent = `10 misiones completadas · ${estado.progreso.xp_total} XP acumulados`;
  const siguiente = estado.regiones.find(region => region.orden === 2);
  $('cierre-continuar').hidden = !siguiente?.desbloqueada || !siguiente.misiones.length;
  $('cierre-region').showModal();
}
