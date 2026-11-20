-- Carga inicial incremental: 3 regiones, 3 logros y SOLO la mision 01.
-- Ejecutar despues de schema.app.sql. No borra ni reemplaza contenido existente.
-- La cuenta tecnica de autoria esta deshabilitada y no sirve para iniciar sesion.
SET NAMES utf8mb4;
USE queryquest_app;
START TRANSACTION;

INSERT INTO usuarios (nombre_usuario, correo, password_hash, rol, nombre_visible, personaje, activo)
SELECT 'catalogo_inicial', 'catalogo@queryquest.invalid', '$2y$10$0q73EqF/DpM9c/7kkM0vL.qH2m6zNqNqWqsu6x1WYqeOdIPnV/3AW',
       'docente', 'Catálogo inicial de QueryQuest', 'aventurero', FALSE
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE nombre_usuario = 'catalogo_inicial');

INSERT INTO regiones (codigo, nombre, nivel, orden, descripcion)
SELECT 'archivo', 'El archivo de Tabularia', 'inicial', 1,
       'Consultar el padrón para identificar a los especialistas que conocen las marcas de cantera.'
WHERE NOT EXISTS (SELECT 1 FROM regiones WHERE codigo = 'archivo');
INSERT INTO regiones (codigo, nombre, nivel, orden, descripcion)
SELECT 'almacen', 'El almacén del paso', 'intermedio', 2,
       'Revisar las provisiones necesarias para la expedición a Vetatabla.'
WHERE NOT EXISTS (SELECT 1 FROM regiones WHERE codigo = 'almacen');
INSERT INTO regiones (codigo, nombre, nivel, orden, descripcion)
SELECT 'sierra', 'La sierra de Vetatabla', 'aplicacion', 3,
       'Cruzar registros de minas, rutas, piedras y canales para reconstruir el vínculo de la compuerta.'
WHERE NOT EXISTS (SELECT 1 FROM regiones WHERE codigo = 'sierra');

INSERT INTO logros (id_region, nombre, descripcion)
SELECT id_region, 'El archivo en orden', 'Completaste las diez misiones del archivo de Tabularia.'
FROM regiones r WHERE codigo = 'archivo'
AND NOT EXISTS (SELECT 1 FROM logros l WHERE l.id_region = r.id_region);
INSERT INTO logros (id_region, nombre, descripcion)
SELECT id_region, 'Provisiones listas', 'Completaste las diez misiones del almacén del paso.'
FROM regiones r WHERE codigo = 'almacen'
AND NOT EXISTS (SELECT 1 FROM logros l WHERE l.id_region = r.id_region);
INSERT INTO logros (id_region, nombre, descripcion)
SELECT id_region, 'El cauce recuperado', 'Completaste las diez misiones de la sierra de Vetatabla.'
FROM regiones r WHERE codigo = 'sierra'
AND NOT EXISTS (SELECT 1 FROM logros l WHERE l.id_region = r.id_region);

INSERT INTO misiones (id_region, numero_orden, titulo, estado, xp_recompensa)
SELECT id_region, 1, 'La cámara de los registros', 'disponible', 50
FROM regiones WHERE codigo = 'archivo'
AND NOT EXISTS (SELECT 1 FROM misiones WHERE numero_orden = 1);

INSERT INTO versiones_mision
  (id_mision, creado_por, numero_version, dataset_codigo, contexto_narrativo,
   consigna, pista, solucion_referencia, estado_version, publicada_en)
SELECT m.id_mision, u.id_usuario, 1, 'tabularia_v1',
       'Mara: La piedra nueva ya está instalada, pero su marca no quedó vinculada en el códice. Empecemos revisando el padrón de la ciudad para saber con quién contamos.',
       'Muestra todas las columnas y todas las filas de la tabla habitantes. No se exige un orden específico.',
       'SELECT permite consultar registros. El asterisco selecciona todas las columnas de una tabla.',
       'SELECT * FROM habitantes;', 'publicada', CURRENT_TIMESTAMP
FROM misiones m CROSS JOIN usuarios u
WHERE m.numero_orden = 1 AND u.nombre_usuario = 'catalogo_inicial'
AND NOT EXISTS (SELECT 1 FROM versiones_mision v WHERE v.id_mision = m.id_mision);

COMMIT;
