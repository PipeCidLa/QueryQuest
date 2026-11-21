<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/region_inicial_tests.php';

$casos = [
    [7,'SELECT * FROM habitantes ORDER BY experencia DESC,id ASC','error_sintaxis',['experencia','experiencia']],
    [1,'SELECT * FROM habitates','error_sintaxis',['habitates','habitantes']],
    [10,'SELECT * FROM habitantes WHERE experiencia = > 3','error_sintaxis',['operador','>=']],
    [9,'SELECT profesion FROM habitantes','incorrecto',['repetidos','únicos']],
    [6,'SELECT * FROM habitantes ORDER BY nombre ASC,id DESC','incorrecto',['filas son correctas','orden']],
    [4,'SELECT id,nombre FROM habitantes','incorrecto',['filas','filtros']],
    [1,'SELECT nombre FROM habitantes','incorrecto',['columnas']],
];
foreach ($casos as [$numero,$sql,$estado,$palabras]) {
    $resultado=evaluarConsulta($misiones[$numero],$sql);
    comprobar($resultado['estado']===$estado,'estado de retroalimentación en misión '.$numero);
    foreach ($palabras as $palabra) comprobar(str_contains($resultado['retroalimentacion'],$palabra),'mensaje contiene '.$palabra);
    if ($numero===9) comprobar(!str_contains($resultado['retroalimentacion'],'orden'),'misión 09 no exige orden');
}
comprobar(str_contains($misiones[10]['pista'],'LIMIT'),'pista introduce LIMIT');
comprobar($misiones[10]['numero_version']===2,'pista conserva la versión anterior');
echo "Retroalimentación y pistas comprobadas sin modificar avance.\n";
