/* =========================================================
   MAINTENIX - Sistema de Registro de Manutenção
   Banco de Dados: MySQL 8+
   ========================================================= */

/* =========================
   DATABASE
   ========================= */

CREATE DATABASE IF NOT EXISTS maintenix
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE maintenix;

/* =========================
   USERS
   ========================= */

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,

  active TINYINT(1) NOT NULL DEFAULT 1,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

/* =========================
   MACHINES
   ========================= */

CREATE TABLE machines (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  name VARCHAR(150) NOT NULL,          -- Ex: Extrusora DS
  line VARCHAR(100),
  location VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  photo_url VARCHAR(255),

  created_by BIGINT UNSIGNED NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_machines_created_by
    FOREIGN KEY (created_by)
    REFERENCES users(id)
) ENGINE=InnoDB;

/* =========================
   MAINTENANCE RECORDS
   (Pendência + Solução)
   ========================= */

CREATE TABLE maintenance_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  machine_id BIGINT UNSIGNED NOT NULL,

  created_by BIGINT UNSIGNED NOT NULL,   -- quem criou a pendência
  finished_by BIGINT UNSIGNED NULL,      -- quem resolveu

  status ENUM('PENDING', 'DONE') NOT NULL DEFAULT 'PENDING',
  priority ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',

  problem_description TEXT NOT NULL,
  solution_description TEXT,

  started_at DATETIME,
  finished_at DATETIME,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_mr_machine
    FOREIGN KEY (machine_id)
    REFERENCES machines(id),

  CONSTRAINT fk_mr_created_by
    FOREIGN KEY (created_by)
    REFERENCES users(id),

  CONSTRAINT fk_mr_finished_by
    FOREIGN KEY (finished_by)
    REFERENCES users(id)
) ENGINE=InnoDB;

/* =========================
   MAINTENANCE PHOTOS
   (Antes / Depois)
   ========================= */

CREATE TABLE maintenance_photos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  maintenance_record_id BIGINT UNSIGNED NOT NULL,

  type ENUM('BEFORE', 'AFTER') NOT NULL,
  file_url VARCHAR(255) NOT NULL,

  created_by BIGINT UNSIGNED NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_mp_record
    FOREIGN KEY (maintenance_record_id)
    REFERENCES maintenance_records(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_mp_created_by
    FOREIGN KEY (created_by)
    REFERENCES users(id)
) ENGINE=InnoDB;

/* =========================
   MAINTENANCE EVENTS
   (Troca / Ajuste / Inspeção)
   ========================= */

CREATE TABLE maintenance_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  maintenance_record_id BIGINT UNSIGNED NOT NULL,
  machine_id BIGINT UNSIGNED NOT NULL,

  component_name VARCHAR(150) NOT NULL,       -- Ex: Junta rotativa
  event_type ENUM(
    'REPLACEMENT',
    'INSPECTION',
    'ADJUSTMENT'
  ) NOT NULL,

  event_date DATE NOT NULL,

  used_part_description VARCHAR(255),          -- descrição livre
  quantity DECIMAL(10,2) DEFAULT 1,

  removed_condition VARCHAR(150),              -- vazando, gasta, quebrada
  destination ENUM(
    'REPAIR',
    'SCRAP',
    'ANALYSIS',
    'STORAGE',
    'RETURN'
  ),

  observation TEXT,
  photo_url VARCHAR(255),

  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_me_record
    FOREIGN KEY (maintenance_record_id)
    REFERENCES maintenance_records(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_me_machine
    FOREIGN KEY (machine_id)
    REFERENCES machines(id),

  CONSTRAINT fk_me_created_by
    FOREIGN KEY (created_by)
    REFERENCES users(id)
) ENGINE=InnoDB;

/* =========================
   INDEXES
   ========================= */

CREATE INDEX idx_mr_machine
  ON maintenance_records(machine_id);

CREATE INDEX idx_mr_status
  ON maintenance_records(status);

CREATE INDEX idx_me_machine
  ON maintenance_events(machine_id);

CREATE INDEX idx_me_component
  ON maintenance_events(component_name);

CREATE INDEX idx_me_event_date
  ON maintenance_events(event_date);

/* =========================================================
   END OF FILE
   ========================================================= */
