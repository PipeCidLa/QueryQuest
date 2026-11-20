// ProgressService.js — Progreso y logros del jugador.
// pide GET /api/progreso, construye un Player y lo guarda en GameState.

import { ApiClient } from './ApiClient.js';
import { estado } from '../state/GameState.js';
import { Player } from '../models/Player.js';

export const ProgressService = {
  async refrescar() {
    const dto = await ApiClient.get('/progreso');
    estado.progreso = new Player(dto);
    return estado.progreso;
  },
};