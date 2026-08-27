-- Desglose del pago al médico en el voucher de honorarios.
-- cantidad_entregada: total entregado al médico (suma de los tres).
-- pago_efectivo / pago_transferencia_hospital / pago_transferencia_paciente:
--   cuánto se entregó por cada vía (efectivo, transferencia hospital->médico,
--   transferencia paciente->médico).
ALTER TABLE `voucher_honorarios`
  ADD COLUMN `cantidad_entregada` DECIMAL(20,2) NULL,
  ADD COLUMN `pago_efectivo` DECIMAL(20,2) NULL,
  ADD COLUMN `pago_transferencia_hospital` DECIMAL(20,2) NULL,
  ADD COLUMN `pago_transferencia_paciente` DECIMAL(20,2) NULL;
