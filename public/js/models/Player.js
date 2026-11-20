// Player.js — Modelo del jugador para cabecera y campamento.
// envuelve el objeto de GET /api/progreso para que las vistas
// lean propiedades ya calculadas (xp, contador, nivel).

import { PERSONAJES } from '../config.js';

export class Player {
  constructor(dto = {}) {
    const u = dto.usuario ?? {};
    this.id_usuario = u.id_usuario ?? null;
    this.nombre_visible = u.nombre_visible ?? 'Estudiante';
    this.personajeCodigo = u.personaje ?? 'aventurero';
    this.xp_total = dto.xp_total ?? 0;
    this.misiones_completadas = dto.misiones_completadas ?? 0;
    this.total_misiones = dto.total_misiones ?? 30;
    this.logros = dto.logros ?? [];
  }

  get personaje() {
    return PERSONAJES.find(p => p.codigo === this.personajeCodigo) ?? PERSONAJES[0];
  }

  get nivelActual() {
    if (this.misiones_completadas >= 21) return 'Aplicación';
    if (this.misiones_completadas >= 11) return 'Intermedio';
    if (this.misiones_completadas >= 1)  return 'Inicial';
    return 'Inicial';
  }

  get contadorTexto() {
    return `${this.misiones_completadas} / ${this.total_misiones} misiones`;
  }
}