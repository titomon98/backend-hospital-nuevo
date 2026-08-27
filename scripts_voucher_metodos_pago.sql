-- Método de pago del voucher de honorarios médicos.
-- cantidad_entregada: monto pagado al médico en ese momento.
-- metodo_pago: 'Efectivo' | 'Transferencia'.
-- tipo_transferencia: solo si es transferencia -> 'Paciente al médico' | 'Hospital al médico'.
ALTER TABLE `voucher_honorarios`
  ADD COLUMN `cantidad_entregada` DECIMAL(20,2) NULL,
  ADD COLUMN `metodo_pago` VARCHAR(30) NULL,
  ADD COLUMN `tipo_transferencia` VARCHAR(50) NULL;
