// config.js — Constantes de UI y assets estáticos del front.
// Qué hace: centraliza valores que NO vienen de la API (personajes, vistas, base de API).
// Qué NO hace: no contiene datos de misiones ni de la BD; eso lo sirve el backend.
// Quién lo usa: todos los módulos que necesitan saber vistas, personajes o la URL base.

export const API_BASE = '/api';

export const vistas = ['menu', 'personaje', 'campamento', 'mision'];
export const vistasEntrada = ['menu', 'personaje'];

// El campo `codigo` coincide con el ENUM usuarios.personaje de la BD.
export const PERSONAJES = [
  { codigo: 'aventurero', nombre: 'Aventurero', imagen: 'assets/personajes/aventurero.png' },
  { codigo: 'aventurera', nombre: 'Aventurera', imagen: 'assets/personajes/aventurera.png' },
];