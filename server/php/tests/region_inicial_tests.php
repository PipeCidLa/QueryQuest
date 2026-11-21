<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/evaluador_tests.php';
$consulta = conectarAplicacion()->query("SELECT m.numero_orden,v.* FROM misiones m JOIN versiones_mision v ON v.id_mision=m.id_mision AND v.estado_version='publicada' WHERE m.numero_orden BETWEEN 1 AND 10 ORDER BY m.numero_orden");
$misiones = [];
foreach ($consulta->fetchAll() as $mision) $misiones[$mision['numero_orden']] = $mision;
comprobar(count($misiones) === 10, 'catálogo inicial completo');

$soluciones = [
    1 => 'SELECT * FROM habitantes',
    2 => 'SELECT nombre FROM habitantes',
    3 => 'SELECT nombre, profesion, experiencia FROM habitantes',
    4 => "SELECT id, nombre FROM habitantes WHERE profesion='Minero'",
    5 => 'SELECT * FROM habitantes WHERE experiencia>=3',
    6 => 'SELECT * FROM habitantes ORDER BY nombre ASC,id ASC',
    7 => 'SELECT * FROM habitantes ORDER BY experiencia DESC,id ASC',
    8 => 'SELECT * FROM habitantes WHERE experiencia<3',
    9 => 'SELECT DISTINCT profesion FROM habitantes',
    10 => 'SELECT * FROM habitantes ORDER BY experiencia DESC,id ASC LIMIT 3',
];
foreach ($soluciones as $numero => $sql) {
    comprobar(evaluarConsulta($misiones[$numero], $sql)['estado'] === 'correcto', "misión {$numero} sin punto y coma");
    comprobar(evaluarConsulta($misiones[$numero], $sql . ';')['estado'] === 'correcto', "misión {$numero} con punto y coma");
}
$incorrectas = [
    2 => 'SELECT DISTINCT nombre FROM habitantes',
    5 => 'SELECT * FROM habitantes WHERE experiencia>3',
    6 => 'SELECT * FROM habitantes ORDER BY nombre ASC,id DESC',
    7 => 'SELECT * FROM habitantes ORDER BY experiencia DESC,id DESC',
    8 => 'SELECT * FROM habitantes WHERE experiencia<=3',
    9 => 'SELECT profesion FROM habitantes',
    10 => 'SELECT * FROM habitantes ORDER BY experiencia DESC,id DESC LIMIT 3',
];
foreach ($incorrectas as $numero => $sql) {
    comprobar(evaluarConsulta($misiones[$numero], $sql)['estado'] === 'incorrecto', "misión {$numero} distingue límites, orden o duplicados incorrectos");
}
comprobar(evaluarConsulta($misiones[5], 'SELECT * FROM habitantes WHERE experiencia>2')['estado'] === 'correcto', 'solución numérica equivalente');
comprobar(evaluarConsulta($misiones[2], 'SELECT nombre FROM habitantes ORDER BY id DESC')['estado'] === 'correcto', 'orden libre cuando no se exige');
comprobar(evaluarConsulta($misiones[9], 'SELECT profesion FROM habitantes GROUP BY profesion')['estado'] === 'correcto', 'agrupación equivalente a DISTINCT');
$otra = $misiones[1]; $otra['numero_version'] = 2;
comprobar(evaluarConsulta($otra, 'SELECT * FROM habitantes')['estado'] === 'error_evaluador', 'no hereda criterios a una versión sin verificar');
echo "Primera región comprobada contra MariaDB. Sin modificar cuentas, progreso o logros.\n";
