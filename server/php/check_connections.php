<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/conexiones.php';

function comprobarDenegacion(PDO $conexion, string $sql, string $descripcion): void
{
    try {
        $conexion->query($sql);
    } catch (PDOException $error) {
        // Un error de sintaxis o de conexión no demuestra que el permiso esté bloqueado.
        $codigo = (int) ($error->errorInfo[1] ?? 0);
        if (in_array($codigo, [1044, 1142, 1143], true)) {
            echo "OK: {$descripcion}.\n";
            return;
        }
        throw new RuntimeException("No se pudo verificar: {$descripcion}.", 0, $error);
    }
    throw new RuntimeException("Permiso excesivo: {$descripcion}.");
}

try {
    $app = conectarAplicacion();
    $sandbox = conectarPractica();
    echo 'OK: PHP conectado a ' . $app->query('SELECT VERSION()')->fetchColumn() . ".\n";
    $consulta = $app->prepare('SELECT titulo FROM misiones WHERE numero_orden = ?');
    $consulta->execute([1]);
    if ($consulta->fetchColumn() === false) {
        throw new RuntimeException('Falta cargar la primera misión.');
    }
    echo "OK: lectura parametrizada de la primera misión.\n";

    $filas = $sandbox->query('SELECT * FROM habitantes')->fetchAll();
    if (count($filas) !== 10 || array_keys($filas[0] ?? []) !== ['id', 'nombre', 'profesion', 'experiencia']) {
        throw new RuntimeException('El resultado no coincide con la semilla inicial.');
    }
    echo "OK: la consulta de práctica devuelve 10 habitantes y 4 columnas.\n";

    // WHERE 1=0 comprueba permisos sin cambiar datos, incluso si hubiera una mala configuración.
    comprobarDenegacion($sandbox, 'UPDATE habitantes SET experiencia = experiencia WHERE 1=0', 'sandbox rechaza UPDATE');
    comprobarDenegacion($sandbox, 'DELETE FROM habitantes WHERE 1=0', 'sandbox rechaza DELETE');
    comprobarDenegacion($sandbox, 'INSERT INTO habitantes (nombre, profesion, experiencia) SELECT nombre, profesion, experiencia FROM habitantes WHERE 1=0', 'sandbox rechaza INSERT');
    comprobarDenegacion($sandbox, 'SELECT id_usuario FROM queryquest_app.usuarios LIMIT 0', 'sandbox no puede leer usuarios de la aplicación');
    comprobarDenegacion($app, 'SELECT id FROM queryquest_sandbox.habitantes LIMIT 0', 'aplicación no accede directamente a las tablas de práctica');

    // Prueba de escritura del backend con reversión: no deja cuentas de prueba.
    $app->beginTransaction();
    try {
        $nombre = 'prueba_conexion_' . bin2hex(random_bytes(8));
        $insertar = $app->prepare('INSERT INTO usuarios (nombre_usuario, correo, password_hash, nombre_visible) VALUES (?, ?, ?, ?)');
        $insertar->execute([$nombre, $nombre . '@queryquest.invalid', password_hash(bin2hex(random_bytes(32)), PASSWORD_DEFAULT), 'Prueba temporal']);
        $id = $app->lastInsertId();
        $actualizar = $app->prepare('UPDATE usuarios SET nombre_visible = ? WHERE id_usuario = ?');
        $actualizar->execute(['Prueba actualizada', $id]);
        if ($actualizar->rowCount() !== 1) {
            throw new RuntimeException('Falló la actualización temporal.');
        }
        $borrar = $app->prepare('DELETE FROM usuarios WHERE id_usuario = ?');
        $borrar->execute([$id]);
        if ($borrar->rowCount() !== 1) {
            throw new RuntimeException('Falló la eliminación temporal.');
        }
    } finally {
        $app->rollBack();
    }
    echo "OK: aplicación puede insertar, actualizar y eliminar; prueba revertida.\n";
    echo "Conexiones y permisos comprobados. El evaluador web todavía no está conectado.\n";
} catch (Throwable $error) {
    fwrite(STDERR, "Falló la comprobación de conexiones o permisos. No se muestran credenciales.\n");
    exit(1);
}
