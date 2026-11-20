<?php
declare(strict_types=1);

// La configuración local queda fuera de public/ y no se comparte por Git.
function cargarConfiguracion(): array
{
    $archivo = dirname(__DIR__, 2) . '/.env.php-local';
    if (!is_file($archivo)) {
        throw new RuntimeException('Falta la configuración local. Ejecuta server/php/setup_local.php.');
    }

    $configuracion = parse_ini_file($archivo, false, INI_SCANNER_RAW);
    if ($configuracion === false) {
        throw new RuntimeException('No se pudo leer la configuración local.');
    }

    $obligatorias = [
        'DB_HOST', 'DB_PORT', 'DB_APP_NAME', 'DB_APP_USER', 'DB_APP_PASS',
        'DB_SANDBOX_NAME', 'DB_SANDBOX_USER', 'DB_SANDBOX_PASS',
    ];
    foreach ($obligatorias as $nombre) {
        if (!isset($configuracion[$nombre]) || $configuracion[$nombre] === '') {
            throw new RuntimeException("Falta la variable de configuración {$nombre}.");
        }
    }

    $puerto = filter_var($configuracion['DB_PORT'], FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1, 'max_range' => 65535],
    ]);
    if ($puerto === false) {
        throw new RuntimeException('DB_PORT debe ser un puerto válido.');
    }

    // Evita introducir parámetros adicionales en el DSN de PDO.
    foreach (['DB_HOST', 'DB_APP_NAME', 'DB_SANDBOX_NAME'] as $nombre) {
        if (!preg_match('/\A[a-zA-Z0-9_.-]+\z/', $configuracion[$nombre])) {
            throw new RuntimeException("Valor no válido para {$nombre}.");
        }
    }

    return $configuracion;
}
