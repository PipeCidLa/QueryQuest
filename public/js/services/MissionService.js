// Carga regiones y misiones; envía consultas y conserva su resultado.

import { ApiClient } from './ApiClient.js';
import { estado } from '../state/GameState.js';
import { Mission } from '../models/Mission.js';
import { AttemptResult } from '../models/AttemptResult.js';

export const MissionService = {
  async cargarRegiones() {
    estado.regiones = await ApiClient.get('/regiones');
    return estado.regiones;
  },

  async abrir(idMision) {
    const dto = await ApiClient.get(`/misiones/${idMision}`);
    estado.misionActual = new Mission(dto);
    return estado.misionActual;
  },

  async ejecutar(consulta) {
    if (!estado.misionActual) throw new Error('No hay misión abierta.');
    const dto = await ApiClient.post(
      `/misiones/${estado.misionActual.id_mision}/ejecutar`,
      { consulta, id_version: estado.misionActual.id_version }
    );
    const resultado = new AttemptResult(dto);
    estado.siguienteMisionId = dto.hay_siguiente ? dto.siguiente_mision_id ?? null : null;
    return resultado;
  },

  // Devuelve la siguiente misión disponible tras completar la actual, si existe.
  buscarSiguiente() {
    const idActual = estado.misionActual?.id_mision;
    if (!idActual) return null;
    const planas = estado.regiones.flatMap(r => r.misiones);
    const idx = planas.findIndex(m => m.id_mision === idActual);
    if (idx < 0) return null;
    const siguiente = planas[idx + 1];
    return siguiente && siguiente.estado_usuario !== 'bloqueada' ? siguiente : null;
  },
};