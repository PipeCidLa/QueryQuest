<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

function abrirConexion(array $configuracion, string $destino): PDO
{
    if (!in_array($destino, ['APP', 'SANDBOX'], true)) {
        throw new InvalidArgumentException('Destino de conexión desconocido.');
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        $configuracion['DB_HOST'],
        $configuracion['DB_PORT'],
        $configuracion["DB_{$destino}_NAME"]
    );

    return new PDO($dsn, $configuracion["DB_{$destino}_USER"], $configuracion["DB_{$destino}_PASS"], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_MULTI_STATEMENTS => false,
        PDO::ATTR_TIMEOUT => 5,
    ]);
}

function conectarAplicacion(): PDO
{
    static $conexion = null;
    return $conexion ??= abrirConexion(cargarConfiguracion(), 'APP');
}

function conectarPractica(): PDO
{
    static $conexion = null;
    // Esta conexión nunca recibe las credenciales de la base de usuarios.
    return $conexion ??= abrirConexion(cargarConfiguracion(), 'SANDBOX');
}
