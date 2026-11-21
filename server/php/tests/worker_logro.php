<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require dirname(__DIR__) . '/conexiones.php';
require dirname(__DIR__) . '/catalogo.php';
require dirname(__DIR__) . '/evaluador.php';
require dirname(__DIR__) . '/intentos.php';
$nombre = $argv[1] ?? '';
if (!preg_match('/\Aqa_phase_[a-f0-9]{6}\z/', $nombre)) exit(1);
$consulta = conectarAplicacion()->prepare("SELECT id_usuario FROM usuarios WHERE nombre_usuario=? AND correo=? AND rol='estudiante'");
$consulta->execute([$nombre,$nombre.'@queryquest.invalid']);
$id = $consulta->fetchColumn();
if (!$id) exit(1);
$mision = obtenerMision((int) $id, (int) conectarAplicacion()->query('SELECT id_mision FROM misiones WHERE numero_orden=10')->fetchColumn());
$resultado = evaluarConsulta($mision, 'SELECT * FROM habitantes ORDER BY experiencia DESC,id ASC LIMIT 3');
$respuesta = guardarIntento((int) $id,$mision,'SELECT * FROM habitantes ORDER BY experiencia DESC,id ASC LIMIT 3',$resultado);
echo json_encode(['xp'=>$respuesta['xp_otorgado'],'logro'=>$respuesta['logro_nuevo']],JSON_THROW_ON_ERROR);
