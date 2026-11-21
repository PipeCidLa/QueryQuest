import { ESTADOS_MISION } from '../config.js';
import { estado } from '../state/GameState.js';
import { $ } from '../utils/dom.js';

const ICONOS = { inicial: '🏰', intermedio: '🌲', aplicacion: '🔮' };
let regionSeleccionada = null;

function pintarMisiones(region, abrirMision, enfocar) {
  regionSeleccionada = region.id_region;
  $('region-detalle').hidden = false;
  $('titulo-region').textContent = region.nombre;
  $('descripcion-region').textContent = region.descripcion;
  const lista = $('lista-misiones');
  lista.replaceChildren();
  if (!region.misiones.length) {
    const aviso = document.createElement('p');
    aviso.textContent = 'Has abierto el camino a esta región. Sus misiones estarán disponibles más adelante.';
    lista.append(aviso);
  }
  region.misiones.forEach(mision => {
    const boton = document.createElement('button');
    boton.className = 'mision';
    boton.type = 'button';
    boton.dataset.misionId = mision.id_mision;
    boton.dataset.estado = mision.estado_usuario;
    boton.disabled = mision.estado_usuario === ESTADOS_MISION.BLOQUEADA;
    const numero = document.createElement('span');
    numero.className = 'numero-mision';
    numero.textContent = String(mision.numero_orden).padStart(2, '0');
    const titulo = document.createElement('strong');
    titulo.textContent = mision.titulo;
    const situacion = document.createElement('small');
    situacion.textContent = mision.completada ? 'Completada' : boton.disabled ? 'Bloqueada' : 'Disponible';
    boton.append(numero, titulo, situacion);
    boton.onclick = () => abrirMision(mision.id_mision);
    lista.append(boton);
  });
  $('ruta-misiones').querySelectorAll('button').forEach(boton => {
    boton.setAttribute('aria-expanded', String(Number(boton.dataset.regionId) === region.id_region));
  });
  if (enfocar) $('titulo-region').focus();
}

export function renderMapa(abrirMision) {
  const ruta = $('ruta-misiones');
  ruta.replaceChildren();
  estado.regiones.forEach(region => {
    const grupo = document.createElement('div');
    grupo.className = 'grupo';
    const boton = document.createElement('button');
    boton.className = 'region';
    boton.type = 'button';
    boton.dataset.regionId = region.id_region;
    boton.disabled = !region.desbloqueada;
    boton.setAttribute('aria-controls', 'region-detalle');
    boton.setAttribute('aria-expanded', String(region.id_region === regionSeleccionada));
    const icono = document.createElement('span');
    icono.className = 'mapa-icono';
    icono.textContent = ICONOS[region.nivel] ?? '◆';
    icono.setAttribute('aria-hidden', 'true');
    const nombre = document.createElement('strong');
    nombre.textContent = region.nombre;
    const avance = document.createElement('small');
    avance.textContent = region.desbloqueada ? `${region.completadas} / 10 misiones` : 'Bloqueada';
    boton.append(icono, nombre, avance);
    boton.onclick = () => pintarMisiones(region, abrirMision, true);
    grupo.append(boton);
    ruta.append(grupo);
  });
  const seleccionada = estado.regiones.find(r => r.id_region === regionSeleccionada && r.desbloqueada);
  if (seleccionada) pintarMisiones(seleccionada, abrirMision, false);
  else $('region-detalle').hidden = true;
}
