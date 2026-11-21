// Crea tablas con texto y centraliza mensajes, resultados y foco.

export const $ = id => document.getElementById(id);

export function crearTabla(encabezados, datos) {
  const tabla = document.createElement('table');
  const thead = tabla.createTHead().insertRow();
  encabezados.forEach(texto => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = texto;
    thead.append(th);
  });
  const cuerpo = tabla.createTBody();
  datos.forEach(valores => {
    const fila = cuerpo.insertRow();
    valores.forEach(v => { fila.insertCell().textContent = v; });
  });
  return tabla;
}

export function mostrarMensaje(texto, estado = '') {
  const m = $('mensaje');
  m.textContent = texto;
  m.dataset.estado = estado;
}

export function reiniciarResultado() {
  $('panel-resultado').hidden = true;
  $('resultado').replaceChildren();
  $('siguiente').hidden = true;
  mostrarMensaje('Aquí verás el resultado al pulsar Ejecutar.');
}

export function enfocar(id) {
  const el = $(id);
  if (el && typeof el.focus === 'function') el.focus();
}
export function mostrarMensajeAuth(texto, estado = '') {
  ['mensaje-auth', 'mensaje-personaje'].forEach(id => {
    const mensaje = $(id);
    mensaje.textContent = texto;
    mensaje.dataset.estado = estado;
    mensaje.hidden = !texto;
  });
}
