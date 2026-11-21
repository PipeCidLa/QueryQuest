<?php
declare(strict_types=1);

function criterioDeEvaluacion(array $mision): ?array
{
    // Un cambio de versión debe revisar también el criterio; no se hereda a ciegas.
    $version = $mision['numero_version'] ?? 1;
    $validada = $version === 1 || ($version === 2 && in_array($mision['numero_orden'], [6,7,10], true));
    if ($mision['dataset_codigo'] !== 'tabularia_v1' || !$validada) {
        return null;
    }
    $numero = $mision['numero_orden'];
    if ($numero < 1 || $numero > 10) {
        return null;
    }
    return ['orden_estricto' => in_array($numero, [6,7,10], true)];
}
