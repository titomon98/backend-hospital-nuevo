-- Tipo de descuento de la cuenta: 0 = porcentaje (cuentas.descuento es %), 1 = monto fijo en Q.
ALTER TABLE `cuentas`
  ADD COLUMN `tipo_descuento` TINYINT(1) NOT NULL DEFAULT 0;
