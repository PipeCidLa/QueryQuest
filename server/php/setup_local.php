<?php
declare(strict_types=1);

// Se ejecuta desde la terminal; nunca se publica como una ruta de la aplicación.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$archivoLocal = dirname(__DIR__, 2) . '/.env.php-local';
if (file_exists($archivoLocal)) {
    fwrite(STDERR, "Ya existe .env.php-local. Se conserva la configuración existente.\n");
    exit(1);
}

$host = getenv('DB_SETUP_HOST') ?: '127.0.0.1';
$puerto = getenv('DB_SETUP_PORT') ?: '3306';
$administrador = getenv('DB_SETUP_USER') ?: 'root';
$claveAdministrador = getenv('DB_SETUP_PASS') ?: '';
if (!preg_match('/\A[a-zA-Z0-9_.-]+\z/', $host)
    || !ctype_digit($puerto) || (int) $puerto < 1 || (int) $puerto > 65535) {
    fwrite(STDERR, "Host o puerto de instalación no válido.\n");
    exit(1);
}

$usuariosCreados = [];
$archivoCreado = false;
$conexion = null;
try {
    $conexion = new PDO("mysql:host={$host};port={$puerto};charset=utf8mb4", $administrador, $claveAdministrador, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_MULTI_STATEMENTS => false,
    ]);

    // Se comprueba antes de crear cuentas para no tocar usuarios ya configurados.
    $consulta = $conexion->query("SELECT COUNT(*) FROM mysql.user WHERE User IN ('qq_app', 'qq_sandbox')");
    if ((int) $consulta->fetchColumn() !== 0) {
        throw new RuntimeException('Ya existen usuarios qq_app o qq_sandbox. Revisa su configuración antes de continuar.');
    }
    foreach (['queryquest_app.usuarios', 'queryquest_sandbox.habitantes'] as $tabla) {
        $conexion->query("SELECT 1 FROM {$tabla} LIMIT 0");
    }

    $claveApp = bin2hex(random_bytes(32));
    $claveSandbox = bin2hex(random_bytes(32));
    // Las cuentas solo pueden conectarse desde este computador.
    foreach (['qq_app' => $claveApp, 'qq_sandbox' => $claveSandbox] as $usuario => $clave) {
        $cuenta = $conexion->quote($usuario) . "@'127.0.0.1'";
        $conexion->exec('CREATE USER ' . $cuenta . ' IDENTIFIED BY ' . $conexion->quote($clave));
        $usuariosCreados[] = $cuenta;
        $permisos = $usuario === 'qq_app' ? 'SELECT, INSERT, UPDATE, DELETE' : 'SELECT';
        $base = $usuario === 'qq_app' ? 'queryquest_app' : 'queryquest_sandbox';
        $conexion->exec("GRANT {$permisos} ON {$base}.* TO {$cuenta}");
    }

    $contenido = "; Credenciales locales generadas por setup_local.php. No subir a Git.\n"
        . "DB_HOST=\"{$host}\"\nDB_PORT={$puerto}\n"
        . "DB_APP_NAME=queryquest_app\nDB_APP_USER=qq_app\nDB_APP_PASS=\"{$claveApp}\"\n"
        . "DB_SANDBOX_NAME=queryquest_sandbox\nDB_SANDBOX_USER=qq_sandbox\nDB_SANDBOX_PASS=\"{$claveSandbox}\"\n";

    // El modo x impide sobrescribir un archivo local existente.
    $archivo = fopen($archivoLocal, 'x');
    if ($archivo === false) {
        throw new RuntimeException('No se pudo crear el archivo de configuración.');
    }
    $archivoCreado = true;
    $escritos = fwrite($archivo, $contenido);
    fclose($archivo);
    if ($escritos !== strlen($contenido)) {
        throw new RuntimeException('No se pudo guardar la configuración completa.');
    }

    echo "Creados qq_app y qq_sandbox con permisos separados.\n";
    echo "Configuración guardada en .env.php-local, fuera de public/.\n";
    echo "Ejecuta server/php/check_connections.php para comprobar las conexiones.\n";
} catch (Throwable $error) {
    // Si falla la preparación, se retiran únicamente las cuentas creadas aquí.
    foreach (array_reverse($usuariosCreados) as $cuenta) {
        try {
            $conexion?->exec('DROP USER ' . $cuenta);
        } catch (Throwable) {
            fwrite(STDERR, "No se pudo retirar una cuenta recién creada. Revisa los usuarios locales.\n");
        }
    }
    if ($archivoCreado) {
        unlink($archivoLocal);
    }
    // No se imprimen excepciones de conexión que puedan incluir datos locales.
    fwrite(STDERR, "No se completó la preparación. Revisa credenciales de administración, bases y usuarios existentes.\n");
    exit(1);
}
