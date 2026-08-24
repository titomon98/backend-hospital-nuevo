-- Marca si un expediente es "de seguro". Cuando es_seguro = 1, la deuda del
-- paciente aparece en "Seguros por cobrar" en lugar de "Cuentas por cobrar".
-- Se puede activar/desactivar en cualquier momento desde el menú de expediente.
ALTER TABLE `expedientes`
  ADD COLUMN `es_seguro` TINYINT NOT NULL DEFAULT 0;
