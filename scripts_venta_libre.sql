-- Venta libre: consumos y oxigeno vendidos fuera de una cuenta de paciente.
-- Clientes externos (personas o empresas): solo nombre, en mayusculas.
CREATE TABLE `venta_libre_clientes` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(255) NOT NULL,
  `created_by` VARCHAR(255) NULL,
  `updated_by` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  UNIQUE KEY `uq_venta_libre_clientes_nombre` (`nombre`)
);

-- Una venta. Exactamente uno de los 4 compradores.
-- estado: 1 = por cobrar, 2 = cobrada, 0 = anulada.
CREATE TABLE `venta_libre_cuentas` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id_expediente` INT NULL,
  `id_usuario` INT NULL,
  `id_medico` INT NULL,
  `id_cliente` INT NULL,
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `estado` TINYINT NOT NULL DEFAULT 1,
  `efectivo` DECIMAL(10,2) NULL,
  `tarjeta` DECIMAL(10,2) NULL,
  `deposito` DECIMAL(10,2) NULL,
  `cheque` DECIMAL(10,2) NULL,
  `transferencia` DECIMAL(10,2) NULL,
  `fecha_cobro` DATETIME NULL,
  `cobrado_by` VARCHAR(255) NULL,
  `created_by` VARCHAR(255) NULL,
  `updated_by` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  CONSTRAINT `chk_venta_libre_un_comprador` CHECK (
    (`id_expediente` IS NOT NULL) + (`id_usuario` IS NOT NULL) + (`id_medico` IS NOT NULL) + (`id_cliente` IS NOT NULL) = 1
  ),
  CONSTRAINT `fk_vl_expediente` FOREIGN KEY (`id_expediente`) REFERENCES `expedientes` (`id`),
  CONSTRAINT `fk_vl_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_vl_medico` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id`),
  CONSTRAINT `fk_vl_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `venta_libre_clientes` (`id`)
);

-- Lineas de la venta. tipo: medicamento | anestesico | quirurgico | comun | servicio.
-- inventariado = 1 si se desconto de existencia_actual_farmacia (se devuelve al anular/editar).
CREATE TABLE `venta_libre_detalles` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id_venta_libre` INT NOT NULL,
  `tipo` VARCHAR(20) NOT NULL,
  `id_item` INT NOT NULL,
  `descripcion` VARCHAR(255) NOT NULL,
  `cantidad` DECIMAL(10,2) NOT NULL,
  `precio` DECIMAL(10,2) NOT NULL,
  `total` DECIMAL(10,2) NOT NULL,
  `inventariado` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` VARCHAR(255) NULL,
  `updated_by` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  CONSTRAINT `fk_vld_venta` FOREIGN KEY (`id_venta_libre`) REFERENCES `venta_libre_cuentas` (`id`)
);
