// Registro, acceso y cierre de sesión mediante la API PHP.

import { ApiClient } from './ApiClient.js';
import { estado, resetEstadoSesion } from '../state/GameState.js';

export const AuthService = {
  async restaurar() {
    const { usuario } = await ApiClient.get('/auth/sesion');
    estado.usuario = usuario;
    return usuario;
  },

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
    await ApiClient.post('/auth/logout');
    resetEstadoSesion();
  },
};