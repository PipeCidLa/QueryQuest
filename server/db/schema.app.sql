-- =============================================================================
-- QUERYQUEST · BASE DE DATOS PRINCIPAL (queryquest_app)
-- Motor: MySQL 8.0 / 8.4 LTS (InnoDB, utf8mb4_unicode_ci)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS queryquest_app
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE queryquest_app;

-- 1. USUARIOS
CREATE TABLE usuarios (
  id_usuario INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre_usuario VARCHAR(60) NOT NULL,
  correo VARCHAR(180) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('estudiante','docente') NOT NULL DEFAULT 'estudiante',
  nombre_visible VARCHAR(100) NOT NULL,
  personaje ENUM('aventurero','aventurera') NOT NULL DEFAULT 'aventurero',
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuario_nombre (nombre_usuario),
  UNIQUE KEY uq_usuario_correo (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. RECUPERACION_CONTRASENA
CREATE TABLE recuperacion_contrasena (
  id_token INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expira_en DATETIME NOT NULL,
  usado_en DATETIME NULL DEFAULT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_token),
  UNIQUE KEY uq_token_hash (token_hash),
  CONSTRAINT fk_recup_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CURSOS (ámbito autorizado del docente; el backend valida que id_docente tenga rol = 'docente')
CREATE TABLE cursos (
  id_curso INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_docente INT UNSIGNED NOT NULL,
  codigo VARCHAR(40) NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  anio SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (id_curso),
  UNIQUE KEY uq_curso_codigo (codigo),
  CONSTRAINT fk_curso_docente FOREIGN KEY (id_docente)
    REFERENCES usuarios(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CURSO_ESTUDIANTE (el backend valida que id_estudiante tenga rol = 'estudiante')
CREATE TABLE curso_estudiante (
  id_curso INT UNSIGNED NOT NULL,
  id_estudiante INT UNSIGNED NOT NULL,
  asignado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_curso, id_estudiante),
  CONSTRAINT fk_ce_curso FOREIGN KEY (id_curso)
    REFERENCES cursos(id_curso) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ce_estudiante FOREIGN KEY (id_estudiante)
    REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. REGIONES (3 regiones de 10 misiones cada una)
CREATE TABLE regiones (
  id_region INT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(40) NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  nivel ENUM('inicial','intermedio','aplicacion') NOT NULL,
  orden SMALLINT UNSIGNED NOT NULL,
  descripcion TEXT NOT NULL,
  PRIMARY KEY (id_region),
  UNIQUE KEY uq_region_codigo (codigo),
  UNIQUE KEY uq_region_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. MISIONES (30 misiones en total: 10 por cada región)
CREATE TABLE misiones (
  id_mision INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_region INT UNSIGNED NOT NULL,
  numero_orden SMALLINT UNSIGNED NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  estado ENUM('disponible','oculta') NOT NULL DEFAULT 'disponible',
  xp_recompensa SMALLINT UNSIGNED NOT NULL DEFAULT 50,
  PRIMARY KEY (id_mision),
  UNIQUE KEY uq_mision_orden (numero_orden),
  CONSTRAINT fk_mision_region FOREIGN KEY (id_region)
    REFERENCES regiones(id_region) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT ck_mision_orden CHECK (numero_orden BETWEEN 1 AND 30),
  CONSTRAINT ck_mision_xp CHECK (xp_recompensa = 50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. VERSIONES_MISION (inmutable tras publicarse; incluye dataset_codigo y UQ compuesta)
CREATE TABLE versiones_mision (
  id_version INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_mision INT UNSIGNED NOT NULL,
  creado_por INT UNSIGNED NOT NULL,
  numero_version SMALLINT UNSIGNED NOT NULL,
  dataset_codigo VARCHAR(40) NOT NULL DEFAULT 'tabularia_v1',
  contexto_narrativo TEXT NOT NULL,
  consigna TEXT NOT NULL,
  pista TEXT NULL DEFAULT NULL,
  solucion_referencia TEXT NOT NULL,
  estado_version ENUM('borrador','verificada','publicada','archivada') NOT NULL DEFAULT 'borrador',
  publicada_en DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (id_version),
  UNIQUE KEY uq_mision_version (id_mision, numero_version),
  KEY idx_vm_vigente (id_mision, estado_version),
  CONSTRAINT fk_vm_mision FOREIGN KEY (id_mision)
    REFERENCES misiones(id_mision) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_vm_autor FOREIGN KEY (creado_por)
    REFERENCES usuarios(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. INTENTOS (ligado a usuario y versión; distingue error_evaluador de fallos académicos)
CREATE TABLE intentos (
  id_intento BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario INT UNSIGNED NOT NULL,
  id_version INT UNSIGNED NOT NULL,
  consulta_sql TEXT NOT NULL,
  estado ENUM('correcto','incorrecto','error_sintaxis','rechazado_seguridad','timeout','error_evaluador') NOT NULL,
  retroalimentacion TEXT NULL DEFAULT NULL,
  tiempo_ms INT UNSIGNED NULL DEFAULT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_intento),
  KEY idx_intento_usuario_fecha (id_usuario, fecha),
  CONSTRAINT fk_intento_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_intento_version FOREIGN KEY (id_version)
    REFERENCES versiones_mision(id_version) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. PROGRESO_MISIONES (clave única compuesta; la transición única de XP se controla en transacción)
CREATE TABLE progreso_misiones (
  id_progreso INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario INT UNSIGNED NOT NULL,
  id_mision INT UNSIGNED NOT NULL,
  completada BOOLEAN NOT NULL DEFAULT FALSE,
  xp_otorgado SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  completada_en DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (id_progreso),
  UNIQUE KEY uq_progreso_usuario_mision (id_usuario, id_mision),
  CONSTRAINT fk_prog_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_prog_mision FOREIGN KEY (id_mision)
    REFERENCES misiones(id_mision) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. LOGROS (3 logros, uno por región)
CREATE TABLE logros (
  id_logro INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_region INT UNSIGNED NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT NOT NULL,
  icono VARCHAR(120) NULL DEFAULT NULL,
  PRIMARY KEY (id_logro),
  UNIQUE KEY uq_logro_region (id_region),
  UNIQUE KEY uq_logro_nombre (nombre),
  CONSTRAINT fk_logro_region FOREIGN KEY (id_region)
    REFERENCES regiones(id_region) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. USUARIO_LOGROS (clave única compuesta por usuario y logro)
CREATE TABLE usuario_logros (
  id_usuario_logro INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario INT UNSIGNED NOT NULL,
  id_logro INT UNSIGNED NOT NULL,
  otorgado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario_logro),
  UNIQUE KEY uq_usuario_logro (id_usuario, id_logro),
  CONSTRAINT fk_ul_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ul_logro FOREIGN KEY (id_logro)
    REFERENCES logros(id_logro) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
