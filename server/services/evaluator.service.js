// =============================================================================
// server/services/evaluator.service.js
// Ejecuta la solución de referencia (cacheada por id_version) y la del alumno,
// y compara columnas + filas. Devuelve { estado, columnas, filas, ... }.
// =============================================================================

import { ejecutarEnSandbox } from './sandbox.service.js';

const cacheReferencia = new Map(); // id_version -> { columnas, filas }

function serializarFilas(filas) {
  return filas.map(f => JSON.stringify(f));
}

function mismoConjunto(a, b) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

async function obtenerReferencia(idVersion, sqlReferencia) {
  if (cacheReferencia.has(idVersion)) return cacheReferencia.get(idVersion);

  const r = await ejecutarEnSandbox(sqlReferencia);
  if (!r.ok) {
    throw new Error('La solución de referencia de esta misión no es válida en el servidor.');
  }

  const columnas = r.filas.length ? Object.keys(r.filas[0]) : [];
  const filas = r.filas.map(f => Object.values(f));
  const ref = { columnas, filas };
  cacheReferencia.set(idVersion, ref);
  return ref;
}

export async function evaluar({ idVersion, sqlReferencia, consultaAlumno, ordenEstricto = false }) {
  const referencia = await obtenerReferencia(idVersion, sqlReferencia);
  const intento = await ejecutarEnSandbox(consultaAlumno);

  if (!intento.ok) {
    return {
      estado: intento.estado,
      retroalimentacion: intento.mensaje,
      tiempo_ms: intento.tiempo_ms,
      columnas: [],
      filas: [],
    };
  }

  const columnas = intento.filas.length ? Object.keys(intento.filas[0]) : [];
  const filas = intento.filas.map(f => Object.values(f));

  const mismasColumnas =
    columnas.length === referencia.columnas.length &&
    columnas.every((c, i) => c.toLowerCase() === referencia.columnas[i].toLowerCase());

  const filasA = serializarFilas(filas);
  const filasB = serializarFilas(referencia.filas);

  const mismasFilas = ordenEstricto
    ? filasA.length === filasB.length && filasA.every((v, i) => v === filasB[i])
    : mismoConjunto(filasA, filasB);

  if (mismasColumnas && mismasFilas) {
    return {
      estado: 'correcto',
      retroalimentacion: '¡Misión completada!',
      tiempo_ms: intento.tiempo_ms,
      columnas,
      filas,
    };
  }

  let motivo = 'El resultado no coincide con lo esperado.';
  if (!mismasColumnas) motivo = `Columnas esperadas: ${referencia.columnas.join(', ')}.`;
  else if (!mismasFilas) motivo = 'Las filas no coinciden con lo esperado.';

  return {
    estado: 'incorrecto',
    retroalimentacion: motivo,
    tiempo_ms: intento.tiempo_ms,
    columnas,
    filas,
  };
}