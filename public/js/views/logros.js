import { $ } from '../utils/dom.js';

export function renderLogros(jugador) {
  const contenedor = $('lista-logros');
  contenedor.replaceChildren();
  const logros = jugador?.catalogo_logros ?? [];
  $('contador-logros').textContent = `${jugador?.logros.length ?? 0} / ${logros.length || 3} obtenidos`;
  const obtenidos = logros.filter(logro => logro.obtenido);
  const ultimo = obtenidos.reduce((anterior, actual) =>
    !anterior || (actual.otorgado_en ?? '') > (anterior.otorgado_en ?? '') ? actual : anterior, null);
  const destacado = ultimo ?? logros.find(logro => !logro.obtenido);
  $('etiqueta-ultimo-logro').textContent = ultimo ? 'Último logro' : 'Tu próximo logro';
  $('nombre-ultimo-logro').textContent = destacado?.nombre ?? 'Logros de la aventura';
  $('detalle-ultimo-logro').textContent = ultimo ? ultimo.descripcion
    : destacado ? `Completa las diez misiones de la región «${destacado.region_nombre}».` : '';
  // Solo el archivo tiene insignia propia por ahora; los otros logros usan su nombre.
  $('insignia-ultimo-logro').hidden = !ultimo || ultimo.nombre !== 'El archivo en orden';
  logros.forEach(logro => {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'logro' + (logro.obtenido ? ' logro--obtenido' : '');
    tarjeta.dataset.logroId = logro.id_logro;
    tarjeta.dataset.obtenido = String(logro.obtenido);
    const icono = document.createElement('span');
    icono.className = 'logro-icono';
    icono.textContent = logro.obtenido ? '★' : '◇';
    icono.setAttribute('aria-hidden', 'true');
    const nombre = document.createElement('h3');
    nombre.textContent = logro.nombre;
    const descripcion = document.createElement('p');
    descripcion.textContent = logro.obtenido
      ? logro.descripcion
      : `Completa las diez misiones de la región «${logro.region_nombre}».`;
    const estado = document.createElement('small');
    estado.textContent = logro.obtenido ? 'Obtenido' : 'Por conseguir';
    if (logro.obtenido && logro.otorgado_en) {
      const fecha = new Date(logro.otorgado_en.replace(' ', 'T'));
      if (!Number.isNaN(fecha.getTime())) estado.textContent += ` · ${fecha.toLocaleDateString('es-CL')}`;
    }
    tarjeta.append(icono, nombre, descripcion, estado);
    contenedor.append(tarjeta);
  });
}

export function iniciarPanelLogros() {
  // El resumen siempre está visible; el catálogo se abre a petición del estudiante.
  $('panel-logros').open = false;
}
