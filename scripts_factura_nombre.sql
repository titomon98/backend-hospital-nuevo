-- Facturas: nombre de factura (junto al NIT). La serie deja de usarse; la columna se conserva por historico.
ALTER TABLE `facturas`
  ADD COLUMN `nombre` VARCHAR(255) NULL AFTER `nit`;
