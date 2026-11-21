-- Actualización de pistas: crea versiones nuevas sin alterar los intentos anteriores.
-- Importar después de seed.region_inicial.sql. Repetir no duplica versiones.
SET NAMES utf8mb4;
USE queryquest_app;
START TRANSACTION;

SELECT id_mision FROM misiones WHERE numero_orden=6 FOR UPDATE;
SET @mision=(SELECT id_mision FROM misiones WHERE numero_orden=6);
SET @actual=(SELECT id_version FROM versiones_mision WHERE id_mision=@mision AND estado_version='publicada' ORDER BY numero_version DESC LIMIT 1);
SET @numero=(SELECT COALESCE(MAX(numero_version),0)+1 FROM versiones_mision WHERE id_mision=@mision);
INSERT INTO versiones_mision (id_mision,creado_por,numero_version,dataset_codigo,contexto_narrativo,consigna,pista,solucion_referencia,estado_version,publicada_en)
SELECT id_mision,creado_por,@numero,dataset_codigo,contexto_narrativo,consigna,'SQL ordena primero por la primera columna indicada. Si dos filas tienen el mismo valor, utiliza la segunda para desempatar. ASC ordena de menor a mayor o alfabéticamente.',solucion_referencia,'borrador',NULL
FROM versiones_mision WHERE id_version=@actual AND COALESCE(pista,'')<>'SQL ordena primero por la primera columna indicada. Si dos filas tienen el mismo valor, utiliza la segunda para desempatar. ASC ordena de menor a mayor o alfabéticamente.';
SET @creada=ROW_COUNT();
UPDATE versiones_mision SET estado_version='archivada' WHERE id_version=@actual AND @creada=1;
UPDATE versiones_mision SET estado_version='publicada',publicada_en=CURRENT_TIMESTAMP
WHERE id_mision=@mision AND numero_version=@numero AND @creada=1;

SELECT id_mision FROM misiones WHERE numero_orden=7 FOR UPDATE;
SET @mision=(SELECT id_mision FROM misiones WHERE numero_orden=7);
SET @actual=(SELECT id_version FROM versiones_mision WHERE id_mision=@mision AND estado_version='publicada' ORDER BY numero_version DESC LIMIT 1);
SET @numero=(SELECT COALESCE(MAX(numero_version),0)+1 FROM versiones_mision WHERE id_mision=@mision);
INSERT INTO versiones_mision (id_mision,creado_por,numero_version,dataset_codigo,contexto_narrativo,consigna,pista,solucion_referencia,estado_version,publicada_en)
SELECT id_mision,creado_por,@numero,dataset_codigo,contexto_narrativo,consigna,'La primera columna de ORDER BY define el orden principal. DESC sitúa primero los valores mayores; la siguiente columna se utiliza solo cuando hay empate.',solucion_referencia,'borrador',NULL
FROM versiones_mision WHERE id_version=@actual AND COALESCE(pista,'')<>'La primera columna de ORDER BY define el orden principal. DESC sitúa primero los valores mayores; la siguiente columna se utiliza solo cuando hay empate.';
SET @creada=ROW_COUNT();
UPDATE versiones_mision SET estado_version='archivada' WHERE id_version=@actual AND @creada=1;
UPDATE versiones_mision SET estado_version='publicada',publicada_en=CURRENT_TIMESTAMP
WHERE id_mision=@mision AND numero_version=@numero AND @creada=1;

SELECT id_mision FROM misiones WHERE numero_orden=10 FOR UPDATE;
SET @mision=(SELECT id_mision FROM misiones WHERE numero_orden=10);
SET @actual=(SELECT id_version FROM versiones_mision WHERE id_mision=@mision AND estado_version='publicada' ORDER BY numero_version DESC LIMIT 1);
SET @numero=(SELECT COALESCE(MAX(numero_version),0)+1 FROM versiones_mision WHERE id_mision=@mision);
INSERT INTO versiones_mision (id_mision,creado_por,numero_version,dataset_codigo,contexto_narrativo,consigna,pista,solucion_referencia,estado_version,publicada_en)
SELECT id_mision,creado_por,@numero,dataset_codigo,contexto_narrativo,consigna,'LIMIT permite indicar cuántas filas mostrar. Primero ordena los habitantes según la consigna y después utiliza LIMIT para obtener solo la cantidad solicitada.',solucion_referencia,'borrador',NULL
FROM versiones_mision WHERE id_version=@actual AND COALESCE(pista,'')<>'LIMIT permite indicar cuántas filas mostrar. Primero ordena los habitantes según la consigna y después utiliza LIMIT para obtener solo la cantidad solicitada.';
SET @creada=ROW_COUNT();
UPDATE versiones_mision SET estado_version='archivada' WHERE id_version=@actual AND @creada=1;
UPDATE versiones_mision SET estado_version='publicada',publicada_en=CURRENT_TIMESTAMP
WHERE id_mision=@mision AND numero_version=@numero AND @creada=1;

COMMIT;
