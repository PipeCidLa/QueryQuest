<?php
declare(strict_types=1);

function regionesConMisiones(int $idUsuario): array
{
    $db = conectarAplicacion();
    $regiones = $db->query('SELECT id_region, codigo, nombre, nivel, orden, descripcion FROM regiones ORDER BY orden')->fetchAll();
    $consulta = $db->prepare("SELECT m.id_mision, m.id_region, m.numero_orden, m.titulo, m.xp_recompensa,
        COALESCE(p.completada, 0) AS completada
        FROM misiones m LEFT JOIN progreso_misiones p ON p.id_mision=m.id_mision AND p.id_usuario=?
        WHERE m.estado='disponible' AND EXISTS (SELECT 1 FROM versiones_mision v WHERE v.id_mision=m.id_mision AND v.estado_version='publicada') ORDER BY m.numero_orden");
    $consulta->execute([$idUsuario]);
    $misiones = $consulta->fetchAll();
    $siguienteOrden = 1;
    foreach ($misiones as &$mision) {
        $completada = (bool) $mision['completada'];
        $mision['estado_usuario'] = $completada ? 'completada' : ($mision['numero_orden'] === $siguienteOrden ? 'disponible' : 'bloqueada');
        if ($completada && $mision['numero_orden'] === $siguienteOrden) {
            $siguienteOrden++;
        }
        $mision['completada'] = $completada;
    }
    unset($mision);
    foreach ($regiones as &$region) {
        $region['misiones'] = array_values(array_filter($misiones, fn(array $m): bool => $m['id_region'] === $region['id_region']));
        $region['desbloqueada'] = $siguienteOrden >= (($region['orden'] - 1) * 10 + 1);
        $region['completadas'] = count(array_filter($region['misiones'], fn(array $m): bool => $m['completada']));
    }
    return $regiones;
}

function obtenerMision(int $idUsuario, int $idMision): array
{
    $permitida = false;
    foreach (regionesConMisiones($idUsuario) as $region) {
        foreach ($region['misiones'] as $mision) {
            if ($mision['id_mision'] === $idMision) {
                $permitida = $mision['estado_usuario'] !== 'bloqueada';
            }
        }
    }
    if (!$permitida) {
        fallo('La misión no está disponible para tu avance actual.', 403);
    }
    $consulta = conectarAplicacion()->prepare("SELECT m.id_mision, m.id_region, m.numero_orden, m.titulo, m.xp_recompensa,
        r.nivel, r.nombre AS region_nombre, v.id_version, v.numero_version, v.contexto_narrativo, v.consigna, v.pista,
        v.solucion_referencia, v.dataset_codigo
        FROM misiones m JOIN regiones r ON r.id_region=m.id_region
        JOIN versiones_mision v ON v.id_mision=m.id_mision AND v.estado_version='publicada'
        WHERE m.id_mision=? AND m.estado='disponible' ORDER BY v.numero_version DESC LIMIT 1");
    $consulta->execute([$idMision]);
    return $consulta->fetch() ?: throw new RuntimeException('No se encontró la versión publicada.');
}

function progresoUsuario(array $usuario): array
{
    $db = conectarAplicacion();
    $consulta = $db->prepare('SELECT COUNT(*) AS completadas, COALESCE(SUM(xp_otorgado),0) AS xp FROM progreso_misiones WHERE id_usuario=? AND completada=1');
    $consulta->execute([$usuario['id_usuario']]);
    $totales = $consulta->fetch();
    $consulta = $db->prepare('SELECT l.id_logro, l.nombre, l.descripcion, l.icono, r.nombre AS region_nombre, ul.otorgado_en FROM logros l JOIN regiones r ON r.id_region=l.id_region LEFT JOIN usuario_logros ul ON ul.id_logro=l.id_logro AND ul.id_usuario=? ORDER BY r.orden');
    $consulta->execute([$usuario['id_usuario']]);
    $catalogo = array_map(static function (array $logro): array {
        $logro['obtenido'] = $logro['otorgado_en'] !== null;
        return $logro;
    }, $consulta->fetchAll());
    return ['usuario' => $usuario, 'xp_total' => (int) $totales['xp'], 'misiones_completadas' => (int) $totales['completadas'],
        'total_misiones' => 30, 'misiones_publicadas' => (int) $db->query("SELECT COUNT(DISTINCT m.id_mision) FROM misiones m JOIN versiones_mision v ON v.id_mision=m.id_mision AND v.estado_version='publicada' WHERE m.estado='disponible'")->fetchColumn(),
        'logros' => array_values(array_filter($catalogo, fn(array $logro): bool => $logro['obtenido'])), 'catalogo_logros' => $catalogo];
}
