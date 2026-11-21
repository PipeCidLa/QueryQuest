// Todas las peticiones pasan por aquí para compartir cookies y el token de sesión.
import { API_BASE } from '../config.js';

let csrfToken = null;

async function request(metodo, ruta, body) {
  if (metodo !== 'GET' && !csrfToken) {
    await request('GET', '/auth/sesion');
  }
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (metodo !== 'GET') headers['X-CSRF-Token'] = csrfToken;

  let res;
  try {
    res = await fetch(API_BASE + ruta, {
      method: metodo, credentials: 'same-origin', headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error('No se pudo contactar con PHP. Comprueba que el servidor local esté iniciado.');
  }
  const data = await res.json().catch(() => null);
  if (data?.csrf_token) csrfToken = data.csrf_token;
  if (!res.ok || data === null) {
    const err = new Error(data?.retroalimentacion || data?.error || 'El servidor no devolvió una respuesta válida.');
    err.status = res.status;
    if (res.status === 401 || res.status === 403) csrfToken = null;
    throw err;
  }
  return data;
}

export const ApiClient = {
  get: ruta => request('GET', ruta),
  post: (ruta, body) => request('POST', ruta, body),
  patch: (ruta, body) => request('PATCH', ruta, body),
};
