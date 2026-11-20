// =============================================================================
// public/js/controllers/entrada.js
// Login/registro, selector de personaje y arranque del campamento.
// Une AuthService + vistas de entrada. No conoce SQL ni misiones.
// =============================================================================

import { PERSONAJES } from '../config.js';
import { estado } from '../state/GameState.js';
import { $, mostrarMensajeAuth } from '../utils/dom.js';
import { mostrarVista, abrirMapa } from '../views/navegacion.js';
import { aplicarPersonaje, personajeActual } from '../views/personaje.js';
import { AuthService } from '../services/AuthService.js';
import { MissionService } from '../services/MissionService.js';
import { ProgressService } from '../services/ProgressService.js';
import { renderHeader } from '../views/header.js';
import { renderMapa } from '../views/mapa.js';

function cambiarPersonaje(paso) {
  estado.personajeIndice =
    (estado.personajeIndice + paso + PERSONAJES.length) % PERSONAJES.length;
  aplicarPersonaje();
}

async function irAlCampamento() {
  try {
    await MissionService.cargarRegiones();
    await ProgressService.refrescar();
    renderHeader();
    renderMapa(abrirMisionDesdeMapa);
    abrirMapa(false);
    mostrarVista('campamento', 'titulo-campamento');
  } catch (e) {
    mostrarMensajeAuth(e.message, 'error');
  }
}

async function iniciarSesion(evento) {
  evento.preventDefault();
  const nombreUsuario = $('nombre-usuario').value.trim();
  const password = $('password').value;
  try {
    await AuthService.login({ nombreUsuario, password });
    estado.personajeIndice = PERSONAJES.findIndex(p => p.codigo === estado.usuario.personaje);
    if (estado.personajeIndice < 0) estado.personajeIndice = 0;
    aplicarPersonaje();
    mostrarVista('personaje', 'titulo-personaje');
  } catch (e) {
    mostrarMensajeAuth(e.message, 'error');
  }
}

async function registrarCuenta() {
  const nombreUsuario = $('nombre-usuario').value.trim();
  const password = $('password').value;
  if (!nombreUsuario || password.length < 6) {
    mostrarMensajeAuth('Usuario y contraseña (mín. 6) son obligatorios.', 'error');
    return;
  }
  try {
    await AuthService.registrar({
      nombreUsuario,
      correo: `${nombreUsuario}@demo.local`,
      password,
      nombreVisible: nombreUsuario,
      personaje: personajeActual().codigo,
    });
    aplicarPersonaje();
    mostrarVista('personaje', 'titulo-personaje');
  } catch (e) {
    mostrarMensajeAuth(e.message, 'error');
  }
}

async function comenzarAventura() {
  try {
    // Persistir el personaje elegido (opcional si ya lo guardaste en registro).
    await fetch('/api/usuarios/me', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personaje: personajeActual().codigo }),
    }).catch(() => {});
    await irAlCampamento();
  } catch (e) {
    mostrarMensajeAuth(e.message, 'error');
  }
}

async function cerrarSesion() {
  await AuthService.logout();
  mostrarVista('menu', 'titulo-menu');
  mostrarMensajeAuth('');
}

// Importación diferida para evitar ciclo con campamento.js
let abrirMisionDesdeMapa = () => {};
export function registrarAbrirMision(fn) { abrirMisionDesdeMapa = fn; }

export function initEntrada() {
  $('formulario-entrada').onsubmit = iniciarSesion;
  $('boton-registro').onclick = registrarCuenta;
  $('volver-entrada').onclick = () => mostrarVista('menu', 'titulo-menu');
  $('personaje-anterior').onclick = () => cambiarPersonaje(-1);
  $('personaje-siguiente').onclick = () => cambiarPersonaje(1);
  $('comenzar').onclick = comenzarAventura;
  $('cerrar-sesion').onclick = cerrarSesion;
}