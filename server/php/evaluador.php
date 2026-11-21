<?php
declare(strict_types=1);

require_once __DIR__ . '/criterios.php';
require_once __DIR__ . '/retroalimentacion.php';

const LIMITE_FILAS = 200;
const LIMITE_BYTES = 131072;
const TIEMPO_SQL = 2.0;

// Se distinguen literales e identificadores para no confundir un texto con una instrucción.
function validarSql(string $sql): string
{
    $sql = trim($sql);
    if ($sql === '' || strlen($sql) > 5000) {
        throw new InvalidArgumentException('Escribe una consulta de hasta 5.000 bytes.');
    }
    $tokens = [];
    $posicion = 0;
    while ($posicion < strlen($sql)) {
        $caracter = $sql[$posicion];
        if (ctype_space($caracter)) {
            $posicion++;
            continue;
        }
        if (substr($sql, $posicion, 2) === '--' || substr($sql, $posicion, 2) === '/*' || $caracter === '#') {
            throw new InvalidArgumentException('En esta etapa escribe la consulta sin comentarios SQL.');
        }
        if ($caracter === "'") {
            $inicio = $posicion++;
            $cerrado = false;
            while ($posicion < strlen($sql)) {
                if ($sql[$posicion] === '\\') {
                    $posicion += 2;
                } elseif ($sql[$posicion] === "'") {
                    if (($sql[$posicion + 1] ?? '') === "'") {
                        $posicion += 2;
                    } else {
                        $posicion++;
                        $cerrado = true;
                        break;
                    }
                } else {
                    $posicion++;
                }
            }
            if (!$cerrado) {
                throw new InvalidArgumentException('Revisa las comillas del texto.');
            }
            $tokens[] = ['tipo' => 'texto', 'valor' => substr($sql, $inicio, $posicion - $inicio)];
            continue;
        }
        if ($caracter === '`') {
            if (!preg_match('/\G`([a-zA-Z_][a-zA-Z_0-9]*)`/A', $sql, $coincidencia, 0, $posicion)) {
                throw new InvalidArgumentException('Revisa el identificador entre acentos graves.');
            }
            $tokens[] = ['tipo' => 'identificador', 'valor' => strtoupper($coincidencia[1])];
            $posicion += strlen($coincidencia[0]);
            continue;
        }
        if (preg_match('/\G([a-zA-Z_][a-zA-Z_0-9]*|[0-9]+(?:\.[0-9]+)?)/A', $sql, $coincidencia, 0, $posicion)) {
            $tokens[] = ['tipo' => 'palabra', 'valor' => strtoupper($coincidencia[0])];
            $posicion += strlen($coincidencia[0]);
            continue;
        }
        if (str_contains('.,()*+-/=<>!%;', $caracter)) {
            $tokens[] = ['tipo' => 'simbolo', 'valor' => $caracter];
            $posicion++;
            continue;
        }
        throw new InvalidArgumentException('La consulta contiene un símbolo no admitido. Usa comillas simples para los textos.');
    }
    if (($tokens[0]['valor'] ?? '') !== 'SELECT' || $tokens[0]['tipo'] !== 'palabra') {
        throw new InvalidArgumentException('Solo se permiten consultas SELECT.');
    }
    if (end($tokens)['valor'] === ';') {
        array_pop($tokens);
        $sql = rtrim(substr($sql, 0, -1));
    }
    $prohibidas = ['INSERT','UPDATE','DELETE','DROP','ALTER','CREATE','TRUNCATE','RENAME',
        'GRANT','REVOKE','INTO','OUTFILE','DUMPFILE','PROCEDURE','LOCK','UNLOCK','SET',
        'INFORMATION_SCHEMA','PERFORMANCE_SCHEMA','MYSQL','SYS','QUERYQUEST_APP'];
    $funciones = ['COUNT','SUM','AVG','MIN','MAX','ROUND','COALESCE','IFNULL','LOWER','UPPER','LENGTH','CHAR_LENGTH','ABS'];
    $agrupaciones = ['SELECT','FROM','WHERE','JOIN','ON','AND','OR','NOT','IN','EXISTS','HAVING'];
    foreach ($tokens as $indice => $token) {
        if ($token['tipo'] === 'texto') {
            continue;
        }
        if ($token['valor'] === ';' || in_array($token['valor'], $prohibidas, true)) {
            throw new InvalidArgumentException('La consulta contiene una operación no permitida. Ejecuta una sola sentencia SELECT.');
        }
        if ($token['tipo'] !== 'simbolo' && ($tokens[$indice + 1]['valor'] ?? '') === '('
            && !in_array($token['valor'], array_merge($funciones, $agrupaciones), true)) {
            throw new InvalidArgumentException('La consulta utiliza una función que no forma parte de los ejercicios habilitados.');
        }
    }
    return $sql;
}

function consultarPractica(string $sql): array
{
    $db = conectarPractica();
    $db->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, false);
    // MariaDB mide este límite en segundos. No se utiliza MAX_EXECUTION_TIME de MySQL.
    $consulta = $db->query('SET STATEMENT max_statement_time=' . TIEMPO_SQL . ' FOR ' . $sql);
    try {
        $columnas = [];
        for ($i = 0; $i < $consulta->columnCount(); $i++) {
            $columnas[] = $consulta->getColumnMeta($i)['name'];
        }
        if (count($columnas) > 20) {
            throw new LengthException('El resultado supera el máximo de veinte columnas.');
        }
        $filas = [];
        $bytes = 0;
        while (($fila = $consulta->fetch(PDO::FETCH_NUM)) !== false) {
            $bytes += strlen(json_encode($fila, JSON_THROW_ON_ERROR));
            if (count($filas) >= LIMITE_FILAS || $bytes > LIMITE_BYTES) {
                throw new LengthException('El resultado supera el límite de 200 filas o 128 KiB. Reduce la consulta.');
            }
            $filas[] = $fila;
        }
        return ['columnas' => $columnas, 'filas' => $filas];
    } finally {
        $consulta->closeCursor();
    }
}

function compararFilas(array $filas, bool $ordenEstricto = false): array
{
    // Se conservan repeticiones y NULL; el orden solo se ignora cuando la consigna lo permite.
    $normalizadas = array_map(static function (array $fila): string {
        return json_encode(array_map(fn($valor) => $valor === null ? null : (string) $valor, $fila), JSON_THROW_ON_ERROR);
    }, $filas);
    if (!$ordenEstricto) sort($normalizadas, SORT_STRING);
    return $normalizadas;
}

function evaluarConsulta(array $mision, string $sql): array
{
    $inicio = hrtime(true);
    $resultado = ['estado' => 'error_evaluador', 'columnas' => [], 'filas' => [], 'retroalimentacion' => 'El evaluador no está disponible.'];
    $criterio = criterioDeEvaluacion($mision);
    if ($criterio === null) {
        return $resultado + ['tiempo_ms' => 0];
    }
    try {
        $limpia = validarSql($sql);
    } catch (InvalidArgumentException $error) {
        return array_replace($resultado, ['estado' => 'rechazado_seguridad', 'retroalimentacion' => $error->getMessage(), 'tiempo_ms' => 0]);
    }
    try {
        $referencia = consultarPractica($mision['solucion_referencia']);
    } catch (Throwable $error) {
        error_log('QueryQuest: no se pudo ejecutar la referencia; código ' . $error->getCode());
        return $resultado + ['tiempo_ms' => (int) ((hrtime(true) - $inicio) / 1e6)];
    }
    try {
        $datos = consultarPractica($limpia);
        $correcta = count($datos['columnas']) === count($referencia['columnas'])
            && compararFilas($datos['filas'], $criterio['orden_estricto']) === compararFilas($referencia['filas'], $criterio['orden_estricto']);
        $resultado = array_merge($datos, ['estado' => $correcta ? 'correcto' : 'incorrecto',
            'retroalimentacion' => $correcta ? '¡Misión completada!' : explicarResultado($referencia, $datos, $criterio)]);
    } catch (LengthException $error) {
        $resultado['estado'] = 'rechazado_seguridad';
        $resultado['retroalimentacion'] = $error->getMessage();
    } catch (PDOException $error) {
        $codigo = (int) ($error->errorInfo[1] ?? 0);
        if (in_array($codigo, [1969, 3024], true)) {
            $resultado['estado'] = 'timeout';
            $resultado['retroalimentacion'] = 'La consulta superó el tiempo permitido. Revisa los cruces entre tablas.';
        } elseif (in_array($codigo, [1064,1054,1146,1052,1140,1055,1066,1241,1242,1111], true)) {
            $resultado['estado'] = 'error_sintaxis';
            $resultado['retroalimentacion'] = explicarErrorSql($error, $limpia);
        } elseif (in_array($codigo, [1044,1142,1143], true)) {
            $resultado['estado'] = 'rechazado_seguridad';
            $resultado['retroalimentacion'] = 'La consulta intenta acceder a datos no permitidos.';
        } else {
            error_log('QueryQuest: fallo de evaluación; código ' . $codigo);
        }
    }
    $resultado['tiempo_ms'] = (int) ((hrtime(true) - $inicio) / 1e6);
    return $resultado;
}
