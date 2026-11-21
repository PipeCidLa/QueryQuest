// Rutas de la API, pantallas y recursos de los personajes.

export const API_BASE = '/api';

export const vistas = ['menu', 'personaje', 'campamento', 'mision'];
export const vistasEntrada = ['menu', 'personaje'];

// El campo `codigo` coincide con el ENUM usuarios.personaje de la BD.
export const PERSONAJES = [
  { codigo: 'aventurero', nombre: 'Aventurero', imagen: 'assets/personajes/aventurero.png' },
  { codigo: 'aventurera', nombre: 'Aventurera', imagen: 'assets/personajes/aventurera.png' },
];
export const ESTADOS_MISION = Object.freeze({
  BLOQUEADA: 'bloqueada',
  DISPONIBLE: 'disponible',
  COMPLETADA: 'completada',
});
