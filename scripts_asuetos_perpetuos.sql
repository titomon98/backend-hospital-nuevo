-- Asuetos que se repiten cada año (mismo día y mes): perpetuo = 1.
ALTER TABLE `asuetos`
  ADD COLUMN `perpetuo` TINYINT(1) NOT NULL DEFAULT 0;
