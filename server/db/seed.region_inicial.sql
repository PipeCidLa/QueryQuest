-- Primera región: misiones 02 a 10. La misión 01 proviene de seed.app.sql.
-- Importar después de estructuras, seed.sandbox.sql y seed.app.sql.
-- Agrega contenido ausente; no reemplaza versiones, intentos ni progreso.
SET NAMES utf8mb4;
USE queryquest_app;
START TRANSACTION;

INSERT INTO misiones (id_region,numero_orden,titulo,estado,xp_recompensa)
SELECT id_region,2,'Nombres del padrón','disponible',50 FROM regiones
WHERE codigo='archivo' AND NOT EXISTS (SELECT 1 FROM misiones WHERE numero_orden=2);

INSERT INTO versiones_mision
 (id_mision,creado_por,numero_version,dataset_codigo,contexto_narrativo,consigna,pista,solucion_referencia,estado_version,publicada_en)
SELECT m.id_mision,u.id_usuario,1,'tabularia_v1','Mara: Para empezar la lista de contactos, necesito únicamente los nombres del padrón.','Muestra la columna nombre de todos los habitantes, conservando los nombres repetidos. No se exige orden.','Especifica la columna que necesitas después de SELECT.','SELECT nombre FROM habitantes;','publicada',CURRENT_TIMESTAMP
FROM misiones m CROSS JOIN usuarios u
WHERE m.numero_orden=2 AND u.nombre_usuario='catalogo_inicial'
AND NOT EXISTS (SELECT 1 FROM versiones_mision v WHERE v.id_mision=m.id_mision);

INSERT INTO misiones (id_region,numero_orden,titulo,estado,xp_recompensa)
SELECT id_region,3,'Oficios y experiencia','disponible',50 FROM regiones
WHERE codigo='archivo' AND NOT EXISTS (SELECT 1 FROM misiones WHERE numero_orden=3);

INSERT INTO versiones_mision
 (id_mision,creado_por,numero_version,dataset_codigo,contexto_narrativo,consigna,pista,solucion_referencia,estado_version,publicada_en)
SELECT m.id_mision,u.id_usuario,1,'tabularia_v1','Mara: Antes de elegir a quién consultar, revisemos qué oficio tiene cada persona y cuánto lleva trabajando.','Muestra nombre, profesion y experiencia, en ese orden, para todos los habitantes. No se exige orden de filas.','Separa con comas las tres columnas solicitadas.','SELECT nombre, profesion, experiencia FROM habitantes;','publicada',CURRENT_TIMESTAMP
FROM misiones m CROSS JOIN usuarios u
WHERE m.numero_orden=3 AND u.nombre_usuario='catalogo_inicial'
AND NOT EXISTS (SELECT 1 FROM versiones_mision v WHERE v.id_mision=m.id_mision);

INSERT INTO misiones (id_region,numero_orden,titulo,estado,xp_recompensa)
SELECT id_region,4,'Oficio de la piedra','disponible',50 FROM regiones
WHERE codigo='archivo' AND NOT EXISTS (SELECT 1 FROM misiones WHERE numero_orden=4);

INSERT INTO versiones_mision
 (id_mision,creado_por,numero_version,dataset_codigo,contexto_narrativo,consigna,pista,solucion_referencia,estado_version,publicada_en)
SELECT m.id_mision,u.id_usuario,1,'tabularia_v1','Mara: Quienes trabajan en las minas pueden reconocer las marcas de cantera. Separemos sus registros.','Muestra id y nombre, en ese orden, de los habitantes cuya profesion sea ''Minero''. No se exige orden de filas.','WHERE permite filtrar registros; escribe el oficio entre comillas simples.','SELECT id, nombre FROM habitantes WHERE profesion = ''Minero'';','publicada',CURRENT_TIMESTAMP
FROM misiones m CROSS JOIN usuarios u
WHERE m.numero_orden=4 AND u.nombre_usuario='catalogo_inicial'
AND NOT EXISTS (SELECT 1 FROM versiones_mision v WHERE v.id_mision=m.id_mision);

INSERT INTO misiones (id_region,numero_orden,titulo,estado,xp_recompensa)
SELECT id_region,5,'Los primeros años','disponible',50 FROM regiones
WHERE codigo='archivo' AND NOT EXISTS (SELECT 1 FROM misiones WHERE numero_orden=5);

INSERT INTO versiones_mision
 (id_mision,creado_por,numero_version,dataset_codigo,contexto_narrativo,consigna,pista,solucion_referencia,estado_version,publicada_en)
SELECT m.id_mision,u.id_usuario,1,'tabularia_v1','Mara: Incluyamos a quienes ya cuentan con tres años de oficio. También necesitamos a quienes cumplen justo ese límite.','Muestra todas las columnas de los habitantes con experiencia mayor o igual a 3. No se exige orden.','El operador >= incluye el valor del límite.','SELECT * FROM habitantes WHERE experiencia >= 3;','publicada',CURRENT_TIMESTAMP
FROM misiones m CROSS JOIN usuarios u
WHERE m.numero_orden=5 AND u.nombre_usuario='catalogo_inicial'
AND NOT EXISTS (SELECT 1 FROM versiones_mision v WHERE v.id_mision=m.id_mision);

INSERT INTO misiones (id_region,numero_orden,titulo,estado,xp_recompensa)
SELECT id_region,6,'El archivo por nombre','disponible',50 FROM regiones
WHERE codigo='archivo' AND NOT EXISTS (SELECT 1 FROM misiones WHERE numero_orden=6);

INSERT INTO versiones_mision
 (id_mision,creado_por,numero_version,dataset_codigo,contexto_narrativo,consigna,pista,solucion_referencia,estado_version,publicada_en)
SELECT m.id_mision,u.id_usuario,1,'tabularia_v1','Mara: Dejemos el padrón en un orden fácil de consultar. Hay personas que comparten nombre.','Muestra todas las columnas y ordena por nombre ascendente. Si dos habitantes tienen el mismo nombre, ordénalos por id ascendente.','ORDER BY admite varios criterios separados por comas.','SELECT * FROM habitantes ORDER BY nombre ASC, id ASC;','publicada',CURRENT_TIMESTAMP
FROM misiones m CROSS JOIN usuarios u
WHERE m.numero_orden=6 AND u.nombre_usuario='catalogo_inicial'
AND NOT EXISTS (SELECT 1 FROM versiones_mision v WHERE v.id_mision=m.id_mision);

INSERT INTO misiones (id_region,numero_orden,titulo,estado,xp_recompensa)
SELECT id_region,7,'Quienes conocen la veta','disponible',50 FROM regiones
WHERE codigo='archivo' AND NOT EXISTS (SELECT 1 FROM misiones WHERE numero_orden=7);

INSERT INTO versiones_mision
 (id_mision,creado_por,numero_version,dataset_codigo,contexto_narrativo,consigna,pista,solucion_referencia,estado_version,publicada_en)
SELECT m.id_mision,u.id_usuario,1,'tabularia_v1','Mara: La cuadrilla necesita consultar primero a quienes tienen más experiencia. Ordenemos la lista antes de salir.','Muestra todas las columnas ordenadas por experiencia descendente y, en caso de empate, por id ascendente.','DESC ordena de mayor a menor; el segundo criterio resuelve los empates.','SELECT * FROM habitantes ORDER BY experiencia DESC, id ASC;','publicada',CURRENT_TIMESTAMP
FROM misiones m CROSS JOIN usuarios u
WHERE m.numero_orden=7 AND u.nombre_usuario='catalogo_inicial'
AND NOT EXISTS (SELECT 1 FROM versiones_mision v WHERE v.id_mision=m.id_mision);

INSERT INTO misiones (id_region,numero_orden,titulo,estado,xp_recompensa)
SELECT id_region,8,'El aprendiz ausente','disponible',50 FROM regiones
WHERE codigo='archivo' AND NOT EXISTS (SELECT 1 FROM misiones WHERE numero_orden=8);

INSERT INTO versiones_mision
 (id_mision,creado_por,numero_version,dataset_codigo,contexto_narrativo,consigna,pista,solucion_referencia,estado_version,publicada_en)
SELECT m.id_mision,u.id_usuario,1,'tabularia_v1','Mara: Completemos la revisión identificando a quienes todavía no llegan a los tres años de oficio.','Muestra todas las columnas de los habitantes con experiencia menor que 3. No incluyas a quienes tienen exactamente 3. No se exige orden.','El operador < no incluye el valor indicado.','SELECT * FROM habitantes WHERE experiencia < 3;','publicada',CURRENT_TIMESTAMP
FROM misiones m CROSS JOIN usuarios u
WHERE m.numero_orden=8 AND u.nombre_usuario='catalogo_inicial'
AND NOT EXISTS (SELECT 1 FROM versiones_mision v WHERE v.id_mision=m.id_mision);

INSERT INTO misiones (id_region,numero_orden,titulo,estado,xp_recompensa)
SELECT id_region,9,'Oficios de Tabularia','disponible',50 FROM regiones
WHERE codigo='archivo' AND NOT EXISTS (SELECT 1 FROM misiones WHERE numero_orden=9);

INSERT INTO versiones_mision
 (id_mision,creado_por,numero_version,dataset_codigo,contexto_narrativo,consigna,pista,solucion_referencia,estado_version,publicada_en)
SELECT m.id_mision,u.id_usuario,1,'tabularia_v1','Mara: El informe necesita un catálogo de oficios, sin repetir una profesión por cada habitante.','Muestra únicamente profesion y elimina los valores repetidos. No se exige orden.','DISTINCT elimina filas repetidas del resultado seleccionado.','SELECT DISTINCT profesion FROM habitantes;','publicada',CURRENT_TIMESTAMP
FROM misiones m CROSS JOIN usuarios u
WHERE m.numero_orden=9 AND u.nombre_usuario='catalogo_inicial'
AND NOT EXISTS (SELECT 1 FROM versiones_mision v WHERE v.id_mision=m.id_mision);

INSERT INTO misiones (id_region,numero_orden,titulo,estado,xp_recompensa)
SELECT id_region,10,'La primera lista','disponible',50 FROM regiones
WHERE codigo='archivo' AND NOT EXISTS (SELECT 1 FROM misiones WHERE numero_orden=10);

INSERT INTO versiones_mision
 (id_mision,creado_por,numero_version,dataset_codigo,contexto_narrativo,consigna,pista,solucion_referencia,estado_version,publicada_en)
SELECT m.id_mision,u.id_usuario,1,'tabularia_v1','Mara: Ya podemos cerrar el informe. Reúne a las tres personas con mayor experiencia y llevaremos la lista al almacén de Elia.','Muestra todas las columnas de los 3 habitantes con mayor experiencia. Ordena por experiencia descendente y desempata por id ascendente.','Primero establece el orden y después limita la cantidad de filas.','SELECT * FROM habitantes ORDER BY experiencia DESC, id ASC LIMIT 3;','publicada',CURRENT_TIMESTAMP
FROM misiones m CROSS JOIN usuarios u
WHERE m.numero_orden=10 AND u.nombre_usuario='catalogo_inicial'
AND NOT EXISTS (SELECT 1 FROM versiones_mision v WHERE v.id_mision=m.id_mision);

COMMIT;
