// Muestra la consigna, la estructura de tablas, las pistas y los resultados.

import { estado } from '../state/GameState.js';
import { $, crearTabla, mostrarMensaje, reiniciarResultado } from '../utils/dom.js';
import { mostrarVista } from './navegacion.js';

export function pintarMisionEnPantalla(mision) {
  $('etapa').textContent = `${mision.nivel} · Misión ${String(mision.numero_orden).padStart(2, '0')}`;
  $('titulo-mision').textContent = 'Misión: ' + mision.titulo;
  $('historia').textContent = mision.contexto_narrativo;
  $('objetivo').textContent = mision.consigna;
  $('sql').value = '';
  const tablas = $('tabla-datos');
  tablas.replaceChildren();
  mision.tablas.forEach(tabla => {
    const titulo = document.createElement('h3');
    titulo.textContent = tabla.nombre;
    const resumen = tabla.columnas.map(([nombre, tipo, admiteNull]) => [nombre, describirTipo(tipo), admiteNull === 'Sí' ? 'No' : 'Sí']);
    const detalle = document.createElement('details');
    detalle.className = 'tipos-tecnicos';
    const etiqueta = document.createElement('summary');
    etiqueta.textContent = 'Ver tipos SQL';
    detalle.append(etiqueta, crearTabla(['Columna', 'Tipo SQL', 'Admite NULL'], tabla.columnas));
    tablas.append(titulo, crearTabla(['Columna', 'Tipo de dato', 'Dato obligatorio'], resumen), detalle);
  });

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
function describirTipo(tipo) {
  const sql = tipo.toLowerCase();
  const texto = sql.match(/^varchar\((\d+)\)/);
  if (texto) return `Texto (hasta ${texto[1]} caracteres)`;
  if (/^(smallint|int|bigint|tinyint)/.test(sql)) {
    return (sql.startsWith('smallint') ? 'Entero pequeño' : 'Entero') + (sql.includes('unsigned') ? ' no negativo' : '');
  }
  if (/^(decimal|float|double)/.test(sql)) return 'Número decimal';
  return tipo;
}
