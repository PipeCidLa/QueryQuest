// =============================================================================
// server/services/progress.service.js
// Re-exporta el modelo de progreso para que los controladores no importen
// directamente de models/ (mantiene la frontera services ↔ models).
// =============================================================================

export { obtenerProgresoUsuario } from '../models/progreso.model.js';