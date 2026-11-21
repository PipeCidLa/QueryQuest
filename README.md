# QueryQuest

Plataforma de práctica SQL de Carla Rosso y Felipe Cid para PEP801, AIEP Valparaíso.
El recorrido actual utiliza PHP 8.2, MariaDB 10.4 de XAMPP y JavaScript sin framework.
La primera región tiene diez misiones publicadas. El alcance previsto es de treinta,
distribuidas en Inicial, Intermedio y Aplicación.

## Ejecutar en este computador

1. Iniciar **MySQL** en el panel de XAMPP; en esta instalación el motor es MariaDB.
2. Abrir `iniciar_php.bat` desde la raíz del repositorio.
3. Entrar a [QueryQuest local](http://127.0.0.1:8080) y mantener abierta la terminal.

Para detener el servidor, pulsar Ctrl+C en esa terminal. No hace falta iniciar
Apache para este recorrido. No abrir `index.html` con doble clic ni usar Live Server.

## Preparación en el computador de Felipe

Abrir la carpeta del repositorio en Visual Studio Code. Todos los comandos se
ejecutan en una terminal PowerShell situada en esa carpeta.

1. Tener XAMPP con PHP 8.2 y MariaDB 10.4. PHP necesita `pdo_mysql` y `mbstring`.
2. Iniciar MySQL en XAMPP. En una instalación nueva, importar con phpMyAdmin los
   archivos de `server/db/`, en este orden:
   - `schema.app.sql`
   - `schema.sandbox.sql`
   - `seed.sandbox.sql`
   - `seed.app.sql`
   - `seed.region_inicial.sql`
   - `actualizacion_pistas_inicial.sql`
3. Crear las cuentas restringidas y la configuración local una sola vez:

   ```powershell
   C:\xampp\php\php.exe server/php/setup_local.php
   C:\xampp\php\php.exe server/php/check_connections.php
   ```

4. Ejecutar `iniciar_php.bat`. La ruta utilizada es `C:\xampp\php\php.exe`;
   si XAMPP está en otra ubicación, ajustar esa ruta en el lanzador.

La preparación utiliza por defecto el administrador local `root` sin contraseña
en `127.0.0.1:3306`. Si la instalación tiene otra configuración, consultar
`server/php/LEEME.txt`. La aplicación utiliza `qq_app` y `qq_sandbox`, nunca root.

`.env.php-local` se genera con claves diferentes en cada computador. Está fuera
de `public/` y excluido de Git. La plantilla `.env.php-local.example` sí se comparte.
Si el archivo y las cuentas ya existen, conservarlos y pasar a la comprobación:
no repetir la preparación ni borrar las bases.

## Después de un pull

Los archivos SQL se comparten por Git; las bases locales y las credenciales no.
Si ya están cargadas las diez misiones y las pistas actualizadas, basta con iniciar
el servidor. Para una instalación anterior con solo la primera misión, importar
`seed.region_inicial.sql` y después `actualizacion_pistas_inicial.sql`.
Estas cargas conservan el progreso existente. No ejecutar `reset.sh` ni
`npm run db:reset` sobre la base de trabajo.

## Estructura y responsabilidades

```text
public/
  index.html                 Pantallas y elementos utilizados por las vistas
  css/styles.css             Estilos, distribución y adaptación a móvil
  assets/                    Personajes, escenario e insignias
  js/
    main.js                  Inicio de la interfaz
    controllers/             Eventos de entrada, campamento y misiones
    views/                   Presentación, navegación y efectos
    services/                Solicitudes a la API PHP
    models/                  Datos de usuario, misión y resultado
    state/                   Estado en memoria de la sesión
    utils/                   Formularios, tablas y utilidades del DOM
  api/index.php              Entrada de API para Apache
server/
  php/                       Backend actual y pruebas
  db/                        Estructuras, semillas y actualización de pistas
```

Carla trabaja en PHP, datos y evaluación SQL. Felipe trabaja en la interfaz y los
recursos visuales. Las rutas PHP y las responsabilidades de cada archivo están
descritas en `server/php/LEEME.txt`. El flujo para presentar el avance está en
`GUIA_DE_USO.txt`.

### Código anterior de Express

`server/app.js`, `server/config/`, `server/controllers/`, `server/middleware/`,
`server/models/`, `server/routes/` y `server/services/` pertenecen a la versión
anterior. Se conservan como referencia de la migración y no participan en el
recorrido PHP. `package.json` y `.env.example` corresponden a esa versión.
No se necesita `npm install`, Node ni `npm start` para ejecutar el avance actual.
La carpeta `public/js/services/` sí forma parte del frontend actual.

## Recorrido implementado

Registro, inicio de sesión con cookie y CSRF, selección de personaje, campamento,
mapa y diez misiones progresivas en El archivo de Tabularia. Las consultas se
ejecutan en la base de práctica con una cuenta de solo lectura. El servidor guarda
intentos y concede 50 XP por misión únicamente en su primera resolución correcta.

El campamento tiene una portada dividida entre bienvenida y fogata, el personaje
seleccionado junto al fuego y una fila de estadísticas. El mapa se abre debajo de
su botón. El resumen del logro queda visible y el catálogo completo se despliega
con «Ver todos los logros». La barra superior del campamento conserva «Cerrar
sesión» y oculta el nombre y los contadores repetidos. Se mantiene la tipografía.

Al terminar las diez misiones se guardan 500 XP y el logro El archivo en orden;
aparece un cierre narrativo una sola vez y se habilita el camino a la segunda
región. Sus misiones todavía no están publicadas. La sesión y el progreso se
recuperan al recargar; los ejercicios completados se pueden repetir.

El bosque usa un parallax suave y algunas tarjetas aparecen al desplazarse.
Ambos efectos respetan la preferencia de movimiento reducido. No se animan los
personajes. Los mensajes SQL identifican errores de escritura y diferencias
de columnas, cantidad de filas, repetidos y orden.

## Recursos visuales de Felipe

- Personajes: `public/assets/personajes/aventurero.png` y `aventurera.png`.
- Fondo de la fogata: `public/assets/escenarios/campamento.svg`.
- Insignia: `public/assets/logros/archivo.svg`.
- Catálogo de personajes y rutas: `public/js/config.js`.
- Posición y tamaño junto al fuego: `.campamento-portada .campamento-personaje`
  en `public/css/styles.css`.

Para reemplazar imágenes, conservar el nombre y formato o actualizar sus
referencias. Los sprites admiten transparencia y se muestran completos con
`object-fit: contain`. Añadir un personaje nuevo también requiere actualizar los
valores admitidos por PHP y la base; reemplazar los dos diseños existentes no.

## Comprobaciones

```powershell
C:\xampp\php\php.exe server/php/check_connections.php
C:\xampp\php\php.exe server/php/tests/retroalimentacion_tests.php
```

La segunda orden incluye las pruebas del evaluador y de la primera región.
Necesita las estructuras, semillas y configuración local. Los resultados y el
alcance de las pruebas ejecutadas se registran en `server/php/tests/RESULTADOS.txt`.

## Pendientes

Publicar las otras veinte misiones, implementar el panel docente, la recuperación
por correo, la constancia final y preparar el despliegue. El historial de intentos
ya se guarda; su pantalla de consulta docente sigue pendiente.
Mantener el mapa siempre visible y ampliar la cantidad de ejercicios son ideas
para conversar con Felipe; no forman parte de este cambio.

El servidor integrado está limitado a `127.0.0.1` y se utiliza para desarrollo.
Para Apache, la raíz del sitio debe ser `public/` con la reescritura de `.htaccess`
habilitada. El despliegue definitivo necesita su propia revisión.
