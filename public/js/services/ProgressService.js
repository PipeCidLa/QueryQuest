// Carga el progreso desde PHP y lo guarda en el estado de la interfaz.

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