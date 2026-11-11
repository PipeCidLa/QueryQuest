// QueryQuest - lógica del juego

const XP_POR_MISION = 50;

// Tabla de práctica
const aldeanos = [
  { id: 1, nombre: 'Ana',   aldea: 'Norte', oro: 120 },
  { id: 2, nombre: 'Luis',  aldea: 'Sur',   oro: 80 },
  { id: 3, nombre: 'Mara',  aldea: 'Norte', oro: 200 },
  { id: 4, nombre: 'Tomás', aldea: 'Sur',   oro: 50 },
];
const columnas = Object.keys(aldeanos[0]);
const filas = aldeanos.map(a => columnas.map(c => a[c]));

// Cada misión trae un patrón (expresión regular) para validar la consulta
const misiones = [
  {
    nivel: 'Inicial',
    icono: '🏰',
    titulo: 'La cámara de los registros',
    historia: 'La guardiana necesita recuperar el registro de aldeanos.',
    objetivo: 'Muestra todas las columnas de la tabla aldeanos.',
    pista: 'Usa SELECT * FROM aldeanos o enumera las cuatro columnas en orden.',
    patron: /^select (\*|id,nombre,aldea,oro) from aldeanos$/,
    columnas,
    filas,
  },
  {
    nivel: 'Intermedio',
    icono: '🌲',
    titulo: 'El filtro del tesoro',
    historia: 'Encuentra a quienes pueden financiar la expedición.',
    objetivo: 'Muestra nombre y oro de los aldeanos con más de 100 de oro.',
    pista: 'Combina SELECT nombre, oro con una condición WHERE oro > 100.',
    patron: /^select nombre,oro from aldeanos where oro>100$/,
    columnas: ['nombre', 'oro'],
    filas: [['Ana', 120], ['Mara', 200]],
  },
  {
    nivel: 'Aplicación',
    icono: '🔮',
    titulo: 'La suma de las aldeas',
    historia: 'Prepara el informe final de recursos del reino.',
    objetivo: 'Muestra aldea y el total de oro por aldea, con alias total_oro. Ordena de mayor a menor por total_oro.',
    pista: 'Usa SUM(oro) AS total_oro, GROUP BY aldea y ORDER BY total_oro DESC.',
    patron: /^select aldea,sum\(oro\) (?:as )?total_oro from aldeanos group by aldea order by (?:total_oro|sum\(oro\)|2) desc$/,
    columnas: ['aldea', 'total_oro'],
    filas: [['Norte', 320], ['Sur', 130]],
  },
];

const personajes = [
  { nombre: 'Aventurero', imagen: 'assets/personajes/aventurero.png' },
  { nombre: 'Aventurera', imagen: 'assets/personajes/aventurera.png' },
];

const vistas = ['menu', 'personaje', 'campamento', 'mision'];
const vistasEntrada = ['menu', 'personaje'];

// Estado del juego
let misionActual = 0;
let personajeActual = 0;
const completadas = new Set();

const $ = id => document.getElementById(id);

// Una misión se desbloquea al completar la anterior
const estaDesbloqueada = i => i === 0 || completadas.has(i - 1);


// ---------- Validación del SQL ----------

// Deja la consulta en minúsculas y sin espacios de más para compararla con el patrón
function normalizarSql(texto) {
  return texto
    .trim()
    .toLowerCase()
    .replace(/;\s*$/, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',')
    .replace(/\s*>\s*/g, '>')
    .replace(/sum\s*\(\s*oro\s*\)/g, 'sum(oro)');
}

function esValida(consulta, indice) {
  return misiones[indice].patron.test(normalizarSql(consulta));
}


// ---------- Dibujar la pantalla ----------

function crearTabla(encabezados, datos) {
  const tabla = document.createElement('table');

  const filaEncabezado = tabla.createTHead().insertRow();
  encabezados.forEach(texto => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = texto;
    filaEncabezado.append(th);
  });

  const cuerpo = tabla.createTBody();
  datos.forEach(valores => {
    const fila = cuerpo.insertRow();
    valores.forEach(valor => { fila.insertCell().textContent = valor; });
  });

  return tabla;
}

function crearBotonMision(mision, indice) {
  const bloqueada = !estaDesbloqueada(indice);
  const completada = completadas.has(indice);
  const hayMisionAbierta = !$('vista-mision').hidden;

  const grupo = document.createElement('div');
  grupo.className = 'grupo';

  const nivel = document.createElement('div');
  nivel.className = 'nivel';
  nivel.textContent = mision.nivel;

  const boton = document.createElement('button');
  boton.className = 'mision';
  boton.disabled = bloqueada;
  if (indice === misionActual && hayMisionAbierta) {
    boton.setAttribute('aria-current', 'true');
  }

  const icono = document.createElement('span');
  icono.className = 'mapa-icono';
  icono.setAttribute('aria-hidden', 'true');
  icono.textContent = mision.icono;

  const estado = document.createElement('small');
  estado.textContent = completada ? 'Completada' : bloqueada ? 'Bloqueada' : 'Disponible';

  boton.append(icono, document.createTextNode(mision.titulo), estado);
  boton.onclick = () => abrirMision(indice);

  grupo.append(nivel, boton);
  return grupo;
}

function dibujarMapa() {
  $('ruta-misiones').replaceChildren(...misiones.map(crearBotonMision));
}

function dibujarEstadisticas() {
  const total = misiones.length;
  const hechas = completadas.size;
  const proxima = misiones.find((_, i) => !completadas.has(i));
  const xp = hechas * XP_POR_MISION;

  $('nivel-campamento').textContent = (proxima || misiones.at(-1)).nivel;
  $('xp-campamento').textContent = xp + ' XP';
  $('misiones-campamento').textContent = hechas + ' / ' + total;
  $('proxima-aventura').textContent = proxima ? proxima.titulo : 'Aventura completada';

  $('xp').textContent = xp + ' XP';
  $('contador').textContent = hechas + ' / ' + total + ' misiones';
  $('progreso').max = total;
  $('progreso').value = hechas;
}

function dibujar() {
  dibujarMapa();
  dibujarEstadisticas();
}


// ---------- Navegación ----------

function mostrarVista(vista, idTitulo) {
  const esEntrada = vistasEntrada.includes(vista);

  $('cabecera').hidden = esEntrada;
  $('estadisticas-cabecera').hidden = esEntrada;
  vistas.forEach(nombre => { $('vista-' + nombre).hidden = nombre !== vista; });

  dibujar();
  $(idTitulo).focus();
}

function abrirMapa(abierto) {
  $('vista-mapa').hidden = !abierto;
  $('alternar-mapa').setAttribute('aria-expanded', String(abierto));
  $('alternar-mapa').textContent = abierto ? '◈ Ocultar mapa' : '◈ Abrir mapa';
}


// ---------- Misiones ----------

function mostrarMensaje(texto, estado = '') {
  const mensaje = $('mensaje');
  mensaje.textContent = texto;
  mensaje.dataset.estado = estado;
}

function reiniciarResultado() {
  $('panel-resultado').hidden = true;
  $('resultado').replaceChildren();
  $('siguiente').hidden = true;
  mostrarMensaje('Aquí verás el resultado al pulsar Ejecutar.');
}

function abrirMision(indice) {
  if (!estaDesbloqueada(indice)) return;

  const mision = misiones[indice];
  misionActual = indice;

  $('etapa').textContent = mision.nivel + ' · Misión 0' + (indice + 1);
  $('titulo-mision').textContent = 'Misión: ' + mision.titulo;
  $('historia').textContent = mision.historia;
  $('objetivo').textContent = mision.objetivo;
  $('sql').value = '';

  $('texto-pista').textContent = mision.pista;
  $('texto-pista').hidden = true;
  $('pista').textContent = 'Ver pista';
  $('pista').setAttribute('aria-expanded', 'false');

  reiniciarResultado();
  mostrarVista('mision', 'titulo-mision');
}

function ejecutarConsulta() {
  const consulta = $('sql').value;
  const mision = misiones[misionActual];

  $('panel-resultado').hidden = false;
  $('siguiente').hidden = true;
  $('resultado').replaceChildren();

  if (!consulta.trim()) {
    mostrarMensaje('Escribe una consulta primero.', 'error');
    $('sql').focus();
    return;
  }

  if (!esValida(consulta, misionActual)) {
    mostrarMensaje(
      'La consulta no coincide con los patrones de esta demo. Revisa la consigna o consulta la pista.',
      'error'
    );
    return;
  }

  const primeraVez = !completadas.has(misionActual);
  completadas.add(misionActual);
  dibujar();

  const terminoTodo = completadas.size === misiones.length;
  mostrarMensaje(
    (primeraVez
      ? `¡Misión completada! +${XP_POR_MISION} XP.`
      : 'Consulta aceptada. Ya ganaste los puntos de esta misión.') +
      (terminoTodo ? ' Completaste la demo.' : ''),
    'ok'
  );

  $('resultado').append(crearTabla(mision.columnas, mision.filas));
  $('siguiente').hidden = misionActual === misiones.length - 1;
}

function limpiarEditor() {
  $('sql').value = '';
  reiniciarResultado();
  $('sql').focus();
}

function alternarPista() {
  const texto = $('texto-pista');
  texto.hidden = !texto.hidden;
  $('pista').textContent = texto.hidden ? 'Ver pista' : 'Ocultar pista';
  $('pista').setAttribute('aria-expanded', String(!texto.hidden));
}


// ---------- Personajes ----------

function cambiarPersonaje(paso) {
  personajeActual = (personajeActual + paso + personajes.length) % personajes.length;
  const { nombre, imagen } = personajes[personajeActual];

  ['imagen-previa', 'icono-campamento', 'icono-mapa', 'icono-mision']
    .forEach(id => { $(id).src = imagen; });
  ['nombre-personaje', 'personaje-campamento', 'personaje-mapa']
    .forEach(id => { $(id).textContent = nombre; });
}

function comenzarAventura() {
  const nombre = $('nombre-jugador').value.trim() || 'Estudiante';

  ['jugador-cabecera', 'jugador-mapa', 'jugador-campamento']
    .forEach(id => { $(id).textContent = nombre; });
  $('bienvenida').textContent = '¡Te damos la bienvenida, ' + nombre + '!';

  abrirMapa(false);
  mostrarVista('campamento', 'titulo-campamento');
}


// ---------- Eventos ----------

$('formulario-entrada').onsubmit = evento => {
  evento.preventDefault();
  mostrarVista('personaje', 'titulo-personaje');
};
$('volver-entrada').onclick = () => mostrarVista('menu', 'titulo-menu');
$('personaje-anterior').onclick = () => cambiarPersonaje(-1);
$('personaje-siguiente').onclick = () => cambiarPersonaje(1);
$('comenzar').onclick = comenzarAventura;

$('volver-menu').onclick = () => mostrarVista('menu', 'titulo-menu');
$('alternar-mapa').onclick = () => {
  const abrir = $('vista-mapa').hidden;
  abrirMapa(abrir);
  if (abrir) $('titulo-mapa').focus();
};
$('volver-mapa').onclick = () => {
  abrirMapa(true);
  mostrarVista('campamento', 'titulo-mapa');
};

$('ejecutar').onclick = ejecutarConsulta;
$('limpiar').onclick = limpiarEditor;
$('pista').onclick = alternarPista;
$('siguiente').onclick = () => abrirMision(misionActual + 1);

// Ctrl + Enter también ejecuta la consulta
$('sql').addEventListener('keydown', evento => {
  if ((evento.ctrlKey || evento.metaKey) && evento.key === 'Enter') {
    evento.preventDefault();
    ejecutarConsulta();
  }
});

// Al cargar la página
$('tabla-datos').append(crearTabla(columnas, filas));
dibujar();
