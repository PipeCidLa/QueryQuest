// Datos de la versión publicada de una misión y textos de presentación.

export class Mission {
  constructor(dto) {
    this.id_mision = dto.id_mision;
    this.id_version = dto.id_version;
    this.titulo = dto.titulo;
    this.numero_orden = dto.numero_orden;
    this.nivel = dto.nivel;
    this.region_nombre = dto.region_nombre;
    this.contexto_narrativo = dto.contexto_narrativo;
    this.consigna = dto.consigna;
    this.tablas = dto.tablas ?? [];
    this.pista = dto.pista ?? '';
    this.dataset_codigo = dto.dataset_codigo;
    this.xp_recompensa = dto.xp_recompensa;
  }

  get etiquetaEtapa() {
    const num = String(this.numero_orden).padStart(2, '0');
    return `${this.nivel} · Misión ${num}`;
  }

  get tituloPantalla() {
    return `Misión: ${this.titulo}`;
  }
}