<?php
declare(strict_types=1);

function sugerirNombre(string $escrito, array $disponibles): ?string
{
    $base = strtolower(substr(strrchr('.' . $escrito, '.'), 1));
    $mejor = null;
    $distancia = PHP_INT_MAX;
    foreach ($disponibles as $nombre) {
        $actual = levenshtein($base, strtolower($nombre));
        if ($actual < $distancia) { $distancia = $actual; $mejor = $nombre; }
    }
    return $distancia <= (strlen($base) <= 3 ? 1 : 3) ? $mejor : null;
}

function ocultarTextosSql(string $sql): string
{
    $salida = '';
    $dentro = false;
    for ($i = 0; $i < strlen($sql); $i++) {
        if ($dentro && $sql[$i] === '\\') { $salida .= '  '; $i++; continue; }
        if ($sql[$i] === "'") {
            if ($dentro && ($sql[$i+1] ?? '') === "'") { $salida .= '  '; $i++; continue; }
            $dentro = !$dentro;
            $salida .= ' ';
        } else $salida .= $dentro ? ' ' : $sql[$i];
    }
    return $salida;
}

function explicarErrorSql(PDOException $error, string $sql): string
{
    $codigo = (int) ($error->errorInfo[1] ?? 0);
    $detalle = (string) ($error->errorInfo[2] ?? '');
    if ($codigo === 1054 && preg_match("/Unknown column '([a-zA-Z0-9_.]+)'/i", $detalle, $m)) {
        $nombre = mb_substr($m[1], 0, 80);
        $sugerencia = sugerirNombre($nombre, ['id','nombre','profesion','experiencia']);
        return 'No existe la columna «' . $nombre . '».'
            . ($sugerencia ? ' ¿Quisiste escribir «' . $sugerencia . '»?' : '')
            . ' Revisa la estructura de la tabla del ejercicio.';
    }
    if ($codigo === 1146 && preg_match("/Table '[a-zA-Z0-9_]+\.([a-zA-Z0-9_]+)'/i", $detalle, $m)) {
        $nombre = mb_substr($m[1], 0, 80);
        $sugerencia = sugerirNombre($nombre, ['habitantes','provisiones','minas','rutas','asignaciones','piedras','canales','compuertas']);
        return 'No existe la tabla «' . $nombre . '».' . ($sugerencia ? ' ¿Quisiste escribir «' . $sugerencia . '»?' : ' Revisa el nombre de la tabla.');
    }
    if ($codigo === 1064) {
        $sinTextos = ocultarTextosSql($sql);
        if (preg_match('/=\s*>|=\s*<|>\s+=|<\s+=/', $sinTextos, $m)) {
            $operador = trim($m[0]);
            $correcto = str_contains($operador, '>') ? '>=' : '<=';
            return 'El operador «' . $operador . '» no es válido. Para «' . ($correcto === '>=' ? 'mayor' : 'menor')
                . ' o igual», utiliza ' . $correcto . ', sin espacios entre los símbolos.';
        }
        if (preg_match("/near '(.*)' at line ([0-9]+)/s", $detalle, $m)) {
            $fragmento = mb_substr(trim(preg_replace('/[\x00-\x1f]+/', ' ', $m[1])), 0, 60);
            if ($fragmento !== '') return 'Revisa la sintaxis cerca de «' . $fragmento . '» (línea ' . $m[2] . '). Comprueba las comas, palabras clave y paréntesis.';
        }
        return 'La consulta está incompleta o tiene un error de sintaxis. Revisa SELECT, FROM, comas y paréntesis.';
    }
    if ($codigo === 1052) return 'Hay un nombre de columna ambiguo. Indica a qué tabla pertenece usando su nombre o alias.';
    return 'Revisa las columnas seleccionadas y las cláusulas de la consulta. Puedes consultar la estructura de las tablas debajo del editor.';
}

function explicarResultado(array $referencia, array $datos, array $criterio): string
{
    $columnasEsperadas = count($referencia['columnas']);
    if (count($datos['columnas']) !== $columnasEsperadas) {
        return 'Se solicitaron ' . $columnasEsperadas . ' columnas y tu consulta devuelve ' . count($datos['columnas']) . '. Revisa las columnas indicadas en el objetivo.';
    }
    $esperadas = compararFilas($referencia['filas']);
    $actuales = compararFilas($datos['filas']);
    if ($criterio['orden_estricto'] && $esperadas === $actuales) {
        return 'Las filas son correctas, pero su orden no coincide. Revisa el criterio principal y la columna utilizada para desempatar.';
    }
    $unicasEsperadas = array_values(array_unique($esperadas));
    $unicasActuales = array_values(array_unique($actuales));
    if ($unicasEsperadas === $unicasActuales && count($actuales) > count($esperadas)) {
        return 'Las columnas seleccionadas son correctas, pero el resultado contiene valores repetidos. Revisa cómo obtener valores únicos.';
    }
    if ($unicasEsperadas === $unicasActuales && count($actuales) < count($esperadas)) {
        return 'Faltan repeticiones que forman parte de los registros. Esta misión pide conservar todas las filas solicitadas.';
    }
    if (count($actuales) !== count($esperadas)) {
        return 'El resultado tiene ' . count($actuales) . ' filas y se necesitan ' . count($esperadas)
            . '. Revisa los filtros y, si la consigna lo solicita, el límite de filas.';
    }
    return 'La cantidad de columnas y filas coincide, pero sus valores no son los solicitados. Revisa las columnas y los filtros del objetivo.';
}
