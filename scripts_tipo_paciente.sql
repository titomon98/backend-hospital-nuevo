-- Categoría del paciente por cuenta, para el corte del día. Valores:
-- 'Hospitalización', 'Emergencia', 'Ambulatorio', 'Estudio de sueño', 'Quimioterapia'.
-- Se llena al asignar la habitación / reingreso / emergencia. El corte lo usa
-- directamente y, si está NULL (cuentas viejas), cae a la deducción por costo.
ALTER TABLE `cuentas`
  ADD COLUMN `tipo_paciente` VARCHAR(30) NULL;
