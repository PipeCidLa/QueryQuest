// AuthService.js — Registro, login y logout del estudiante.
// habla con /api/auth/*, guarda el usuario en GameState y notifica.


import { ApiClient } from './ApiClient.js';
import { estado } from '../state/GameState.js';

export const AuthService = {
  async registrar({ nombre_usuario, correo, password, nombre_visible, personaje }) {
    const { usuario } = await ApiClient.post('/auth/registro', {
      nombre_usuario, correo, password, nombre_visible, personaje,
    });
    estado.usuario = usuario;
    return usuario;
  },

  async login({ nombre_usuario, password }) {
    const { usuario } = await ApiClient.post('/auth/login', { nombre_usuario, password });
    estado.usuario = usuario;
    return usuario;
  },

  async logout() {
    await ApiClient.post('/auth/logout').catch(() => {});
    estado.usuario = null;
  },
};