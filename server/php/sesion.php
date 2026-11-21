<?php
declare(strict_types=1);

require_once __DIR__ . '/conexiones.php';
require_once __DIR__ . '/validaciones.php';

function iniciarSesionWeb(): void
{
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_name('qq_php_session');
    session_set_cookie_params([
        'lifetime' => 0, 'path' => '/', 'httponly' => true,
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'samesite' => 'Lax',
    ]);
    session_start();
    if (isset($_SESSION['vence']) && time() >= $_SESSION['vence']) {
        $_SESSION = [];
        session_regenerate_id(true);
    }
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
}

function usuarioActual(): ?array
{
    if (!isset($_SESSION['id_usuario'])) {
        return null;
    }
    $consulta = conectarAplicacion()->prepare('SELECT id_usuario, nombre_usuario, nombre_visible, personaje, rol FROM usuarios WHERE id_usuario = ? AND activo = 1');
    $consulta->execute([$_SESSION['id_usuario']]);
    $usuario = $consulta->fetch();
    if (!$usuario) {
        unset($_SESSION['id_usuario']);
        return null;
    }
    return $usuario;
}

function requerirEstudiante(): array
{
    $usuario = usuarioActual();
    if (!$usuario) {
        fallo('Inicia sesión para continuar.', 401);
    }
    if ($usuario['rol'] !== 'estudiante') {
        fallo('Esta vista corresponde al estudiante. El panel docente se implementa en otra etapa.', 403);
    }
    return $usuario;
}

function comprobarCsrf(): void
{
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!$token || !hash_equals($_SESSION['csrf'], $token)) {
        fallo('La sesión de la página cambió. Recarga e intenta nuevamente.', 403);
    }
}

function autenticar(array $datos, bool $registro): void
{
    limitarPeticiones('acceso:' . ($_SERVER['REMOTE_ADDR'] ?? 'local'), 30, 900);
    $nombre = $datos['nombre_usuario'] ?? '';
    $clave = $datos['password'] ?? '';
    if (!is_string($nombre) || !usuarioValido($nombre, $registro)
        || !is_string($clave) || strlen($clave) < 6 || strlen($clave) > 72 || ($registro && trim($clave) === '')) {
        fallo('Revisa el usuario y la contraseña. Para registrarte, usa de 3 a 15 caracteres, empieza con una letra y no juntes separadores; la clave debe tener de 6 a 72 bytes.');
    }
    $db = conectarAplicacion();
    if ($registro) {
        $correo = $datos['correo'] ?? '';
        $visible = $datos['nombre_visible'] ?? $nombre;
        $personaje = $datos['personaje'] ?? 'aventurero';
        if (is_string($visible)) $visible = trim(preg_replace('/\s+/u', ' ', $visible) ?? '');
        if (!is_string($correo) || strlen($correo) > 180 || !filter_var($correo, FILTER_VALIDATE_EMAIL)
            || !is_string($visible) || !nombreVisibleValido($visible)
            || !in_array($personaje, ['aventurero', 'aventurera'], true)) {
            fallo('Revisa el correo y el nombre para mostrar: usa de 2 a 100 letras, tildes, espacios, apóstrofo o guion, sin números ni emojis.');
        }
        try {
            $consulta = $db->prepare("INSERT INTO usuarios (nombre_usuario, correo, password_hash, nombre_visible, personaje, rol) VALUES (?, ?, ?, ?, ?, 'estudiante')");
            $consulta->execute([$nombre, $correo, password_hash($clave, PASSWORD_DEFAULT), trim($visible), $personaje]);
        } catch (PDOException $error) {
            if (($error->errorInfo[1] ?? 0) === 1062) {
                fallo('El nombre de usuario o correo ya está registrado.', 409);
            }
            throw $error;
        }
        $id = (int) $db->lastInsertId();
    } else {
        $consulta = $db->prepare('SELECT id_usuario, password_hash, activo FROM usuarios WHERE nombre_usuario = ?');
        $consulta->execute([$nombre]);
        $fila = $consulta->fetch();
        if (!$fila || !$fila['activo'] || !password_verify($clave, $fila['password_hash'])) {
            fallo('Usuario o contraseña incorrectos. Si todavía no tienes una cuenta, selecciona «Crear cuenta».', 401);
        }
        $id = (int) $fila['id_usuario'];
    }
    session_regenerate_id(true);
    $_SESSION = ['id_usuario' => $id, 'vence' => time() + 43200, 'csrf' => bin2hex(random_bytes(32))];
    responder(['usuario' => usuarioActual(), 'csrf_token' => $_SESSION['csrf']], $registro ? 201 : 200);
}
