<?php
declare(strict_types=1);

// Punto de entrada de las rutas PHP. Los archivos de servicio quedan fuera de public/.
ini_set('display_errors', '0');
require_once __DIR__ . '/http.php';
require_once __DIR__ . '/sesion.php';
require_once __DIR__ . '/catalogo.php';
require_once __DIR__ . '/evaluador.php';
require_once __DIR__ . '/intentos.php';

try {
    iniciarSesionWeb();
    $ruta = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/', '/');
    $metodo = $_SERVER['REQUEST_METHOD'];

    if ($metodo === 'GET' && $ruta === '/api/auth/sesion') {
        responder(['usuario' => usuarioActual(), 'csrf_token' => $_SESSION['csrf']]);
    }
    if (!in_array($metodo, ['GET', 'HEAD'], true)) {
        comprobarCsrf();
    }
    if ($metodo === 'POST' && in_array($ruta, ['/api/auth/login', '/api/auth/registro'], true)) {
        autenticar(leerJson(), $ruta === '/api/auth/registro');
    }
    if ($metodo === 'POST' && $ruta === '/api/auth/logout') {
        $_SESSION = [];
        session_regenerate_id(true);
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
        responder(['ok' => true, 'csrf_token' => $_SESSION['csrf']]);
    }

    $usuario = requerirEstudiante();
    $idUsuario = (int) $usuario['id_usuario'];
    if ($metodo === 'GET' && $ruta === '/api/regiones') {
        responder(regionesConMisiones($idUsuario));
    }
    if ($metodo === 'GET' && $ruta === '/api/progreso') {
        responder(progresoUsuario($usuario));
    }
    if ($metodo === 'PATCH' && $ruta === '/api/usuarios/me') {
        $datos = leerJson();
        $personaje = $datos['personaje'] ?? '';
        if (!in_array($personaje, ['aventurero', 'aventurera'], true)) {
            fallo('Elige uno de los personajes disponibles.');
        }
        $consulta = conectarAplicacion()->prepare('UPDATE usuarios SET personaje=? WHERE id_usuario=?');
        $consulta->execute([$personaje, $idUsuario]);
        responder(['usuario' => usuarioActual()]);
    }
    if (preg_match('~\A/api/misiones/([1-9][0-9]*)(/ejecutar)?\z~', $ruta, $coincidencia)) {
        $idMision = filter_var($coincidencia[1], FILTER_VALIDATE_INT);
        if (!$idMision) {
            fallo('Identificador de misión no válido.', 404);
        }
        $mision = obtenerMision($idUsuario, $idMision);
        if ($metodo === 'GET' && !isset($coincidencia[2])) {
            unset($mision['solucion_referencia']);
            $mision['tablas'] = [];
            if ($mision['numero_orden'] >= 1 && $mision['numero_orden'] <= 10) {
                $columnas = conectarPractica()->query('SHOW COLUMNS FROM habitantes')->fetchAll();
                $mision['tablas'][] = ['nombre' => 'habitantes', 'columnas' => array_map(
                    fn(array $c): array => [$c['Field'], $c['Type'], $c['Null'] === 'YES' ? 'Sí' : 'No'], $columnas
                )];
            }
            responder($mision);
        }
        if ($metodo === 'POST' && isset($coincidencia[2])) {
            limitarPeticiones('ejecucion:' . $idUsuario, 30, 60);
            $datos = leerJson();
            $sql = $datos['consulta'] ?? null;
            if (!is_string($sql) || !trim($sql) || strlen($sql) > 5000) {
                fallo('Escribe una consulta de hasta 5.000 bytes.', 422);
            }
            if (($datos['id_version'] ?? null) !== $mision['id_version']) {
                fallo('La misión cambió. Vuelve a abrirla antes de ejecutar.', 409);
            }
            $resultado = evaluarConsulta($mision, $sql);
            try {
                $respuesta = guardarIntento($idUsuario, $mision, $sql, $resultado);
            } catch (Throwable $error) {
                error_log('QueryQuest: no se confirmó el intento; código ' . $error->getCode());
                fallo('No se pudo guardar el intento. Tus puntos no cambiaron; vuelve a abrir la misión e intenta nuevamente.', 503);
            }
            responder($respuesta, 201);
        }
    }
    fallo('No se encontró esta operación.', 404);
} catch (Throwable $error) {
    error_log('QueryQuest: fallo de servicio; código ' . $error->getCode());
    fallo('El servicio no está disponible. Comprueba que el servidor de base de datos esté iniciado.', 503);
}
