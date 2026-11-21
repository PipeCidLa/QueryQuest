<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
require dirname(__DIR__) . '/conexiones.php';
require dirname(__DIR__) . '/evaluador.php';

function comprobar(bool $condicion, string $nombre): void
{
    if (!$condicion) {
        throw new RuntimeException('Fallo: ' . $nombre);
    }
    echo "OK: {$nombre}\n";
}

$mision = ['numero_orden' => 1, 'dataset_codigo' => 'tabularia_v1', 'solucion_referencia' => 'SELECT * FROM habitantes;'];
$casos = [
    'SELECT * FROM habitantes;' => 'correcto',
    '  select * FROM habitantes  ' => 'correcto',
    'SELECT id AS codigo, nombre, profesion, experiencia FROM habitantes ORDER BY id DESC' => 'correcto',
    'SELECT nombre FROM habitantes' => 'incorrecto',
    'SELECT * FROM habitantes WHERE id=1' => 'incorrecto',
    'SELECT * FROM habitantes WHERE id=0' => 'incorrecto',
    'SELECT * FROM habitantes UNION ALL SELECT * FROM habitantes' => 'incorrecto',
    "SELECT 'DROP; DELETE' AS texto" => 'incorrecto',
    'SELECT columna_inexistente FROM habitantes' => 'error_sintaxis',
    'SELECT FROM habitantes' => 'error_sintaxis',
    'DELETE FROM habitantes' => 'rechazado_seguridad',
    'SELECT * FROM habitantes; SELECT * FROM habitantes' => 'rechazado_seguridad',
    'SELECT * FROM queryquest_app.usuarios' => 'rechazado_seguridad',
    'SELECT SLEEP(3)' => 'rechazado_seguridad',
    'SELECT GET_LOCK(\'prueba\', 3)' => 'rechazado_seguridad',
    'SELECT * FROM habitantes -- comentario' => 'rechazado_seguridad',
    'SELECT * FROM habitantes a CROSS JOIN habitantes b CROSS JOIN habitantes c' => 'rechazado_seguridad',
];
foreach ($casos as $sql => $esperado) {
    $resultado = evaluarConsulta($mision, $sql);
    comprobar($resultado['estado'] === $esperado, $sql . ' => ' . $esperado);
}
comprobar(compararFilas([[null],[null]]) !== compararFilas([[null],['']]), 'NULL no se confunde con texto vacío');
comprobar(compararFilas([[1],[1]]) !== compararFilas([[1]]), 'se conservan duplicados');
$inicio = microtime(true);
try {
    // Solo el test interno omite el validador para verificar el límite del motor.
    consultarPractica('SELECT SLEEP(4)');
    throw new RuntimeException('No se interrumpió la consulta de prueba.');
} catch (PDOException $error) {
    comprobar(in_array((int) ($error->errorInfo[1] ?? 0), [1969,3024], true), 'MariaDB cancela por tiempo');
    comprobar(microtime(true) - $inicio < 3.5, 'cancelación próxima a los dos segundos configurados');
}
echo "Evaluador comprobado con la base local. No se crearon intentos ni progreso.\n";
