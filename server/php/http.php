<?php
declare(strict_types=1);

function responder(array $datos, int $estado = 200): never
{
    http_response_code($estado);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

function fallo(string $mensaje, int $estado = 400): never
{
    responder(['error' => $mensaje], $estado);
}

function leerJson(): array
{
    if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 32768) {
        fallo('La solicitud supera el tamaño permitido.', 413);
    }
    $contenido = file_get_contents('php://input', false, null, 0, 32769);
    if ($contenido === false || strlen($contenido) > 32768) {
        fallo('La solicitud supera el tamaño permitido.', 413);
    }
    try {
        $datos = json_decode($contenido, true, 32, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        fallo('La solicitud debe contener JSON válido.');
    }
    if (!is_array($datos) || array_is_list($datos)) {
        fallo('El cuerpo debe ser un objeto JSON.');
    }
    return $datos;
}

function limitarPeticiones(string $clave, int $maximo, int $segundos): void
{
    // Los contadores no se guardan en public/ ni contienen contraseñas o consultas.
    $nombre = sys_get_temp_dir() . '/queryquest_limite_' . hash('sha256', __DIR__ . $clave) . '.json';
    $archivo = fopen($nombre, 'c+');
    if (!$archivo || !flock($archivo, LOCK_EX)) {
        fallo('No se pudo comprobar el límite de solicitudes.', 503);
    }
    try {
        $datos = json_decode(stream_get_contents($archivo) ?: '{}', true) ?: [];
        $ahora = time();
        if ($ahora - ($datos['inicio'] ?? 0) >= $segundos) {
            $datos = ['inicio' => $ahora, 'cantidad' => 0];
        }
        $permitida = $datos['cantidad'] < $maximo;
        $datos['cantidad']++;
        rewind($archivo);
        ftruncate($archivo, 0);
        fwrite($archivo, json_encode($datos));
    } finally {
        flock($archivo, LOCK_UN);
        fclose($archivo);
    }
    if (!$permitida) {
        header('Retry-After: ' . $segundos);
        fallo('Demasiados intentos. Espera antes de volver a probar.', 429);
    }
}
