-- Registro de eliminaciones de cuentas de pacientes (emergencia y hospitalización).
-- Se escribe una fila cada vez que gerencia elimina un reingreso/hospitalización
-- o cada vez que se elimina una emergencia. Sirve para auditar quién eliminó,
-- a qué paciente y a qué hora.
CREATE TABLE IF NOT EXISTS `logs_eliminacion_pacientes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_expediente` INT NULL,
  `id_cuenta` INT NULL,
  `numero_expediente` VARCHAR(255) NULL,
  `nombre_paciente` VARCHAR(255) NULL,
  `tipo_cuenta` INT NULL,           -- 1 = Hospitalización, 2 = Emergencia (cuentas.tipo)
  `area` VARCHAR(50) NULL,          -- 'Hospitalización' / 'Emergencia'
  `motivo` VARCHAR(255) NULL,       -- razón de la eliminación (ej. hora de ingreso mal registrada)
  `total_cuenta` DECIMAL(10,2) NULL,
  `tenia_consumos` TINYINT NOT NULL DEFAULT 0,
  `created_by` VARCHAR(255) NULL,   -- usuario que eliminó
  `updated_by` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
