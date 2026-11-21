<?php
declare(strict_types=1);

function guardarIntento(int $idUsuario, array $mision, string $sql, array $resultado): array
{
    $db = conectarAplicacion();
    $primera = false;
    $logroNuevo = null;
    $db->beginTransaction();
    try {
        // Una sola operación por estudiante evita premios duplicados por doble clic.
        $bloqueo = $db->prepare('SELECT id_usuario FROM usuarios WHERE id_usuario=? FOR UPDATE');
        $bloqueo->execute([$idUsuario]);
        $version = $db->prepare("SELECT v.id_version FROM versiones_mision v JOIN misiones m ON m.id_mision=v.id_mision WHERE v.id_version=? AND v.estado_version='publicada' AND m.estado='disponible'");
        $version->execute([$mision['id_version']]);
        if (!$version->fetchColumn()) {
            throw new RuntimeException('La misión cambió durante la evaluación.');
        }
        $consulta = $db->prepare('INSERT INTO intentos (id_usuario,id_version,consulta_sql,estado,retroalimentacion,tiempo_ms) VALUES (?,?,?,?,?,?)');
        $consulta->execute([$idUsuario,$mision['id_version'],$sql,$resultado['estado'],$resultado['retroalimentacion'],$resultado['tiempo_ms']]);
        if ($resultado['estado'] === 'correcto') {
            $consulta = $db->prepare('SELECT completada FROM progreso_misiones WHERE id_usuario=? AND id_mision=? FOR UPDATE');
            $consulta->execute([$idUsuario,$mision['id_mision']]);
            $progreso = $consulta->fetch();
            if (!$progreso) {
                $consulta = $db->prepare('INSERT INTO progreso_misiones (id_usuario,id_mision,completada,xp_otorgado,completada_en) VALUES (?,?,1,?,CURRENT_TIMESTAMP)');
                $consulta->execute([$idUsuario,$mision['id_mision'],$mision['xp_recompensa']]);
                $primera = true;
            } elseif (!$progreso['completada']) {
                $consulta = $db->prepare('UPDATE progreso_misiones SET completada=1,xp_otorgado=?,completada_en=CURRENT_TIMESTAMP WHERE id_usuario=? AND id_mision=?');
                $consulta->execute([$mision['xp_recompensa'],$idUsuario,$mision['id_mision']]);
                $primera = true;
            }
            // El logro requiere las diez misiones de la región completadas.
            $consulta = $db->prepare('SELECT COUNT(*) AS total, SUM(COALESCE(p.completada,0)) AS completadas FROM misiones m LEFT JOIN progreso_misiones p ON p.id_mision=m.id_mision AND p.id_usuario=? WHERE m.id_region=?');
            $consulta->execute([$idUsuario,$mision['id_region']]);
            $region = $consulta->fetch();
            if ((int) $region['total'] === 10 && (int) $region['completadas'] === 10) {
                $consulta = $db->prepare('SELECT id_logro,nombre FROM logros WHERE id_region=?');
                $consulta->execute([$mision['id_region']]);
                $logro = $consulta->fetch();
                if ($logro) {
                    $consulta = $db->prepare('SELECT 1 FROM usuario_logros WHERE id_usuario=? AND id_logro=?');
                    $consulta->execute([$idUsuario,$logro['id_logro']]);
                    if (!$consulta->fetchColumn()) {
                        $consulta = $db->prepare('INSERT INTO usuario_logros (id_usuario,id_logro) VALUES (?,?)');
                        $consulta->execute([$idUsuario,$logro['id_logro']]);
                        $logroNuevo = $logro;
                    }
                }
            }
        }
        $db->commit();
    } catch (Throwable $error) {
        $db->rollBack();
        throw $error;
    }
    $resultado['xp_otorgado'] = $primera ? $mision['xp_recompensa'] : 0;
    $resultado['primera_vez'] = $primera;
    $resultado['logro_nuevo'] = $logroNuevo;
    $resultado['hay_siguiente'] = false;
    $resultado['siguiente_mision_id'] = null;
    if ($resultado['estado'] === 'correcto') {
        foreach (regionesConMisiones($idUsuario) as $regionActual) {
            foreach ($regionActual['misiones'] as $siguiente) {
                if ($siguiente['numero_orden'] === $mision['numero_orden'] + 1 && $siguiente['estado_usuario'] !== 'bloqueada') {
                    $resultado['hay_siguiente'] = true;
                    $resultado['siguiente_mision_id'] = $siguiente['id_mision'];
                }
            }
        }
    }
    if ($primera) {
        $resultado['retroalimentacion'] .= ' +50 XP.';
    } elseif ($resultado['estado'] === 'correcto') {
        $resultado['retroalimentacion'] .= ' Ya habías completado esta misión; tus puntos se conservan.';
    }
    if ($logroNuevo) {
        $resultado['retroalimentacion'] .= ' Logro obtenido: ' . $logroNuevo['nombre'] . '. Puedes verlo en tu campamento.';
    }
    return $resultado;
}
