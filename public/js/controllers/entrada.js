// Entrada y registro comparten el formulario; cada modo valida solo sus campos.
import { PERSONAJES } from '../config.js';
import { estado } from '../state/GameState.js';
import { $, mostrarMensajeAuth } from '../utils/dom.js';
import { validarAcceso } from '../utils/validaciones.js';
import { mostrarVista, abrirMapa } from '../views/navegacion.js';
import { aplicarPersonaje, personajeActual } from '../views/personaje.js';
import { ApiClient } from '../services/ApiClient.js';
import { AuthService } from '../services/AuthService.js';
import { MissionService } from '../services/MissionService.js';
import { ProgressService } from '../services/ProgressService.js';
import { renderHeader } from '../views/header.js';
import { renderMapa } from '../views/mapa.js';

let registro = false;
let enviando = false;
let abrirMisionDesdeMapa = () => {};
export function registrarAbrirMision(fn) { abrirMisionDesdeMapa = fn; }

function cambiarPersonaje(paso) {
  estado.personajeActual = (estado.personajeActual + paso + PERSONAJES.length) % PERSONAJES.length;
  aplicarPersonaje();
}

function cambiarModo(crearCuenta) {
  registro = crearCuenta;
  $('campos-registro').hidden = !registro;
  $('nombre-usuario').maxLength = registro ? 15 : 60;
  $('nombre-visible').required = registro;
  $('correo').required = registro;
  $('password').autocomplete = registro ? 'new-password' : 'current-password';
  $('boton-acceso').textContent = registro ? 'Crear mi cuenta' : 'Iniciar sesión';
  $('boton-registro').textContent = registro ? 'Ya tengo cuenta' : 'Crear cuenta';
  $('descripcion-acceso').textContent = registro
    ? 'Crea tu cuenta para guardar tus misiones y tu progreso.'
    : 'Ingresa con tu usuario y contraseña para continuar tu aventura.';
  $('ayuda-acceso').textContent = registro
    ? '¿Ya te registraste? Selecciona «Ya tengo cuenta».'
    : '¿Es tu primera vez? Selecciona «Crear cuenta» antes de completar el registro.';
  limpiarErrores();
  mostrarMensajeAuth('');
  $('nombre-usuario').focus();
}

function limpiarErrores() {
  ['nombre-usuario', 'password', 'nombre-visible', 'correo'].forEach(id => $(id).removeAttribute('aria-invalid'));
}

async function irAlCampamento() {
  await MissionService.cargarRegiones();
  await ProgressService.refrescar();
  renderHeader();
  renderMapa(abrirMisionDesdeMapa);
  abrirMapa(false);
  mostrarVista('campamento', 'titulo-campamento');
}

async function enviarAcceso(evento) {
  evento.preventDefault();
  if (enviando) return;
  limpiarErrores();
  const datos = {
    nombre_usuario: $('nombre-usuario').value.trim(),
    password: $('password').value,
    nombre_visible: $('nombre-visible').value.trim().replace(/\s+/g, ' '),
    correo: $('correo').value.trim(),
    personaje: personajeActual().codigo,
  };
  const error = validarAcceso(datos, registro);
  if (error) {
    mostrarMensajeAuth(error.mensaje, 'error');
    $(error.campo).setAttribute('aria-invalid', 'true');
    $(error.campo).focus();
    return;
  }

  enviando = true;
  $('boton-acceso').disabled = true;
  $('boton-registro').disabled = true;
  $('formulario-entrada').setAttribute('aria-busy', 'true');
  mostrarMensajeAuth(registro ? 'Creando tu cuenta…' : 'Comprobando tus datos…');
  try {
    if (registro) {
      await AuthService.registrar(datos);
      mostrarMensajeAuth('');
      mostrarVista('personaje', 'titulo-personaje');
    } else {
      await AuthService.login(datos);
      estado.personajeActual = Math.max(0, PERSONAJES.findIndex(p => p.codigo === estado.usuario.personaje));
      aplicarPersonaje();
      await irAlCampamento();
      mostrarMensajeAuth('');
    }
  } catch (error) {
    const mensaje = !registro && error.status === 401
      ? 'Usuario o contraseña incorrectos. Si todavía no tienes una cuenta, selecciona «Crear cuenta».'
      : error.message;
    mostrarMensajeAuth(mensaje, 'error');
  } finally {
    enviando = false;
    $('boton-acceso').disabled = false;
    $('boton-registro').disabled = false;
    $('formulario-entrada').removeAttribute('aria-busy');
  }
}

async function comenzarAventura() {
  $('comenzar').disabled = true;
  try {
    const { usuario } = await ApiClient.patch('/usuarios/me', { personaje: personajeActual().codigo });
    estado.usuario = usuario;
    await irAlCampamento();
    mostrarMensajeAuth('');
  } catch (error) {
    mostrarMensajeAuth(error.message, 'error');
  } finally {
    $('comenzar').disabled = false;
  }
}

async function cerrarSesion() {
  try {
    await AuthService.logout();
    $('password').value = '';
    cambiarModo(false);
    mostrarVista('menu', 'titulo-menu');
  } catch (error) {
    alert(error.message);
  }
}

export function initEntrada() {
  $('formulario-entrada').onsubmit = enviarAcceso;
  $('boton-registro').onclick = () => cambiarModo(!registro);
  $('volver-entrada').onclick = () => mostrarVista('menu', 'titulo-menu');
  $('personaje-anterior').onclick = () => cambiarPersonaje(-1);
  $('personaje-siguiente').onclick = () => cambiarPersonaje(1);
  $('comenzar').onclick = comenzarAventura;
  $('cerrar-sesion').onclick = cerrarSesion;
}

export async function restaurarEntrada() {
  try {
    if (await AuthService.restaurar()) {
      estado.personajeActual = Math.max(0, PERSONAJES.findIndex(p => p.codigo === estado.usuario.personaje));
      aplicarPersonaje();
      await irAlCampamento();
    }
  } catch (error) {
    mostrarMensajeAuth(error.message, 'error');
  }
}
