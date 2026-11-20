-- Dataset tabularia_v1: datos narrativos, sin informacion personal real.
-- Ejecutar despues de schema.sandbox.sql. Semilla inicial; no reinicia el entorno.
-- Los identificadores son estables. Repetir la carga no modifica filas existentes.
SET NAMES utf8mb4;
USE queryquest_sandbox;
START TRANSACTION;

INSERT INTO habitantes (id, nombre, profesion, experiencia)
SELECT 1, 'Mara', 'Escriba', 12 WHERE NOT EXISTS (SELECT 1 FROM habitantes WHERE id = 1);
INSERT INTO habitantes (id, nombre, profesion, experiencia)
SELECT 2, 'Darío', 'Minero', 18 WHERE NOT EXISTS (SELECT 1 FROM habitantes WHERE id = 2);
INSERT INTO habitantes (id, nombre, profesion, experiencia)
SELECT 3, 'Elia', 'Almacenera', 9 WHERE NOT EXISTS (SELECT 1 FROM habitantes WHERE id = 3);
INSERT INTO habitantes (id, nombre, profesion, experiencia)
SELECT 4, 'Inés', 'Minero', 3 WHERE NOT EXISTS (SELECT 1 FROM habitantes WHERE id = 4);
INSERT INTO habitantes (id, nombre, profesion, experiencia)
SELECT 5, 'Tomás', 'Minero', 2 WHERE NOT EXISTS (SELECT 1 FROM habitantes WHERE id = 5);
INSERT INTO habitantes (id, nombre, profesion, experiencia)
SELECT 6, 'Bruno', 'Guardián', 12 WHERE NOT EXISTS (SELECT 1 FROM habitantes WHERE id = 6);
INSERT INTO habitantes (id, nombre, profesion, experiencia)
SELECT 7, 'Lía', 'Cartógrafa', 0 WHERE NOT EXISTS (SELECT 1 FROM habitantes WHERE id = 7);
INSERT INTO habitantes (id, nombre, profesion, experiencia)
SELECT 8, 'Nora', 'Minero', 8 WHERE NOT EXISTS (SELECT 1 FROM habitantes WHERE id = 8);
INSERT INTO habitantes (id, nombre, profesion, experiencia)
SELECT 9, 'Mara', 'Guardián', 4 WHERE NOT EXISTS (SELECT 1 FROM habitantes WHERE id = 9);
INSERT INTO habitantes (id, nombre, profesion, experiencia)
SELECT 10, 'Teo', 'Carpintero', 3 WHERE NOT EXISTS (SELECT 1 FROM habitantes WHERE id = 10);

INSERT INTO provisiones (id, nombre, categoria, cantidad, minimo)
SELECT 1, 'Antorchas', 'Iluminacion', 20, 10 WHERE NOT EXISTS (SELECT 1 FROM provisiones WHERE id = 1);
INSERT INTO provisiones (id, nombre, categoria, cantidad, minimo)
SELECT 2, 'Lámparas', 'Iluminacion', 5, 8 WHERE NOT EXISTS (SELECT 1 FROM provisiones WHERE id = 2);
INSERT INTO provisiones (id, nombre, categoria, cantidad, minimo)
SELECT 3, 'Picos', 'Herramientas', 4, 6 WHERE NOT EXISTS (SELECT 1 FROM provisiones WHERE id = 3);
INSERT INTO provisiones (id, nombre, categoria, cantidad, minimo)
SELECT 4, 'Cuerdas', 'Herramientas', 10, 10 WHERE NOT EXISTS (SELECT 1 FROM provisiones WHERE id = 4);
INSERT INTO provisiones (id, nombre, categoria, cantidad, minimo)
SELECT 5, 'Martillos', 'Herramientas', 0, 3 WHERE NOT EXISTS (SELECT 1 FROM provisiones WHERE id = 5);
INSERT INTO provisiones (id, nombre, categoria, cantidad, minimo)
SELECT 6, 'Raciones', 'Alimentos', 30, 20 WHERE NOT EXISTS (SELECT 1 FROM provisiones WHERE id = 6);
INSERT INTO provisiones (id, nombre, categoria, cantidad, minimo)
SELECT 7, 'Agua', 'Alimentos', 20, 15 WHERE NOT EXISTS (SELECT 1 FROM provisiones WHERE id = 7);
INSERT INTO provisiones (id, nombre, categoria, cantidad, minimo)
SELECT 8, 'Vendas', 'Curacion', 5, 8 WHERE NOT EXISTS (SELECT 1 FROM provisiones WHERE id = 8);

INSERT INTO minas (id, nombre, mineral, operativa)
SELECT 1, 'Veta del Alba', 'Cuarzo', 1 WHERE NOT EXISTS (SELECT 1 FROM minas WHERE id = 1);
INSERT INTO minas (id, nombre, mineral, operativa)
SELECT 2, 'Cantera del Eco', 'Granito', 1 WHERE NOT EXISTS (SELECT 1 FROM minas WHERE id = 2);
INSERT INTO minas (id, nombre, mineral, operativa)
SELECT 3, 'Galería Antigua', 'Hierro', 0 WHERE NOT EXISTS (SELECT 1 FROM minas WHERE id = 3);
INSERT INTO minas (id, nombre, mineral, operativa)
SELECT 4, 'Veta del Norte', 'Cuarzo', 1 WHERE NOT EXISTS (SELECT 1 FROM minas WHERE id = 4);
INSERT INTO minas (id, nombre, mineral, operativa)
SELECT 5, 'Cantera de Bruma', 'Pizarra', 1 WHERE NOT EXISTS (SELECT 1 FROM minas WHERE id = 5);

INSERT INTO rutas (id, mina_id, nombre, estado, distancia_km)
SELECT 1, 1, 'Paso del Alba', 'Abierta', 2.50 WHERE NOT EXISTS (SELECT 1 FROM rutas WHERE id = 1);
INSERT INTO rutas (id, mina_id, nombre, estado, distancia_km)
SELECT 2, 1, 'Sendero del Río', 'Abierta', 2.50 WHERE NOT EXISTS (SELECT 1 FROM rutas WHERE id = 2);
INSERT INTO rutas (id, mina_id, nombre, estado, distancia_km)
SELECT 3, 2, 'Paso del Eco', 'Cerrada', 4.75 WHERE NOT EXISTS (SELECT 1 FROM rutas WHERE id = 3);
INSERT INTO rutas (id, mina_id, nombre, estado, distancia_km)
SELECT 4, 3, 'Camino Antiguo', 'Abierta', 1.25 WHERE NOT EXISTS (SELECT 1 FROM rutas WHERE id = 4);
INSERT INTO rutas (id, mina_id, nombre, estado, distancia_km)
SELECT 5, 5, 'Ladera de Bruma', 'Abierta', 6.00 WHERE NOT EXISTS (SELECT 1 FROM rutas WHERE id = 5);

INSERT INTO asignaciones (habitante_id, mina_id)
SELECT 2, 1 WHERE NOT EXISTS (SELECT 1 FROM asignaciones WHERE habitante_id = 2 AND mina_id = 1);
INSERT INTO asignaciones (habitante_id, mina_id)
SELECT 4, 1 WHERE NOT EXISTS (SELECT 1 FROM asignaciones WHERE habitante_id = 4 AND mina_id = 1);
INSERT INTO asignaciones (habitante_id, mina_id)
SELECT 5, 2 WHERE NOT EXISTS (SELECT 1 FROM asignaciones WHERE habitante_id = 5 AND mina_id = 2);
INSERT INTO asignaciones (habitante_id, mina_id)
SELECT 8, 4 WHERE NOT EXISTS (SELECT 1 FROM asignaciones WHERE habitante_id = 8 AND mina_id = 4);

INSERT INTO piedras (id, marca, mina_id)
SELECT 1, 'VT-A01', 1 WHERE NOT EXISTS (SELECT 1 FROM piedras WHERE id = 1);
INSERT INTO piedras (id, marca, mina_id)
SELECT 2, 'VT-A10', 1 WHERE NOT EXISTS (SELECT 1 FROM piedras WHERE id = 2);
INSERT INTO piedras (id, marca, mina_id)
SELECT 3, 'VT-E02', 2 WHERE NOT EXISTS (SELECT 1 FROM piedras WHERE id = 3);

INSERT INTO canales (id, nombre, guardian_id)
SELECT 1, 'Canal de los Huertos', 6 WHERE NOT EXISTS (SELECT 1 FROM canales WHERE id = 1);
INSERT INTO canales (id, nombre, guardian_id)
SELECT 2, 'Canal de los Talleres', 9 WHERE NOT EXISTS (SELECT 1 FROM canales WHERE id = 2);

INSERT INTO compuertas (id, nombre, canal_id, piedra_id, marca_inspeccion)
SELECT 1, 'Compuerta Principal', 1, NULL, 'VT-A01' WHERE NOT EXISTS (SELECT 1 FROM compuertas WHERE id = 1);
INSERT INTO compuertas (id, nombre, canal_id, piedra_id, marca_inspeccion)
SELECT 2, 'Compuerta de los Talleres', 2, 3, 'VT-E02' WHERE NOT EXISTS (SELECT 1 FROM compuertas WHERE id = 2);

COMMIT;
