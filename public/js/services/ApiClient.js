// ApiClient.js — Único punto de salida HTTP del front.
// envuelve fetch, serializa JSON, maneja errores HTTP y adjunta cookies.


import { API_BASE } from '../config.js';

async function request(metodo, ruta, body) {
  let res;
  try {
    res = await fetch(API_BASE + ruta, {
      method: metodo,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error('No se pudo contactar con el servidor.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const mensaje = data.retroalimentacion || data.error || `Error ${res.status}`;
    const err = new Error(mensaje);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const ApiClient = {
  get: (ruta) => request('GET', ruta),
  post: (ruta, body) => request('POST', ruta, body),
};