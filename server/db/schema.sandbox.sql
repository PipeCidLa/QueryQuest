-- =============================================================================
-- QUERYQUEST · BASE DE DATOS AISLADA DE PRÁCTICA (queryquest_sandbox)
-- Historia: La compuerta de Tabularia (8 tablas, usuario de solo lectura SELECT)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS queryquest_sandbox
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE queryquest_sandbox;

-- 1. HABITANTES
CREATE TABLE habitantes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  profesion VARCHAR(80) NOT NULL,
  experiencia SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. PROVISIONES
CREATE TABLE provisiones (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  categoria VARCHAR(80) NOT NULL,
  cantidad INT UNSIGNED NOT NULL DEFAULT 0,
  minimo INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. MINAS
CREATE TABLE minas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  mineral VARCHAR(80) NOT NULL,
  operativa TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  CONSTRAINT ck_mina_operativa CHECK (operativa IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. RUTAS
CREATE TABLE rutas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  mina_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  estado VARCHAR(40) NOT NULL,
  distancia_km DECIMAL(6,2) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT ck_ruta_distancia CHECK (distancia_km >= 0),
  CONSTRAINT fk_rutas_mina FOREIGN KEY (mina_id)
    REFERENCES minas(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ASIGNACIONES
CREATE TABLE asignaciones (
  habitante_id INT UNSIGNED NOT NULL,
  mina_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (habitante_id, mina_id),
  CONSTRAINT fk_asig_habitante FOREIGN KEY (habitante_id)
    REFERENCES habitantes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_asig_mina FOREIGN KEY (mina_id)
    REFERENCES minas(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. PIEDRAS
CREATE TABLE piedras (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  marca VARCHAR(60) NOT NULL,
  mina_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_piedra_marca (marca),
  CONSTRAINT fk_piedra_mina FOREIGN KEY (mina_id)
    REFERENCES minas(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. CANALES
CREATE TABLE canales (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  guardian_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_canal_guardian FOREIGN KEY (guardian_id)
    REFERENCES habitantes(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. COMPUERTAS (piedra_id admite NULL para Misión 29; Misión 30 cruza marca_inspeccion = piedras.marca)
CREATE TABLE compuertas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  canal_id INT UNSIGNED NOT NULL,
  piedra_id INT UNSIGNED NULL DEFAULT NULL,
  marca_inspeccion VARCHAR(60) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_comp_canal FOREIGN KEY (canal_id)
    REFERENCES canales(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_comp_piedra FOREIGN KEY (piedra_id)
    REFERENCES piedras(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
