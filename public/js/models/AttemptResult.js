// Resultado de la evaluación: filas, mensaje, recompensa y logro obtenido.

const ESTADOS_OK = new Set(['correcto']);

export class AttemptResult {
  constructor(dto = {}) {
    this.estado = dto.estado ?? 'error_evaluador';
    this.columnas = Array.isArray(dto.columnas) ? dto.columnas : [];
    this.filas = Array.isArray(dto.filas) ? dto.filas : [];
    this.retroalimentacion = dto.retroalimentacion ?? '';
    this.tiempo_ms = dto.tiempo_ms ?? null;
    this.xp_otorgado = dto.xp_otorgado ?? 0;
    this.primera_vez = Boolean(dto.primera_vez);
    this.logro_nuevo = dto.logro_nuevo ?? null;
    this.hay_siguiente = Boolean(dto.hay_siguiente);
  }

  get esCorrecto() { return ESTADOS_OK.has(this.estado); }

  get esErrorDeUsuario() {
    return ['incorrecto', 'error_sintaxis'].includes(this.estado);
  }

  get esRechazo() {
    return ['rechazado_seguridad', 'timeout'].includes(this.estado);
  }
}