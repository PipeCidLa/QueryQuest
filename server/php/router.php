<?php
declare(strict_types=1);

// Router del servidor local de PHP. Su raíz pública debe ser public/.
$ruta = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
if (str_starts_with($ruta, '/api/')) {
    require __DIR__ . '/api.php';
    return true;
}
$publica = realpath(dirname(__DIR__, 2) . '/public');
$archivo = realpath($publica . rawurldecode($ruta === '/' ? '/index.html' : $ruta));
if ($archivo !== false && str_starts_with($archivo, $publica . DIRECTORY_SEPARATOR)
    && is_file($archivo) && preg_match('/\.(html|css|js|png|jpg|jpeg|svg|ico|webp|woff2?)$/i', $archivo)) {
    return false;
}
http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo 'Página no encontrada.';
return true;
