-- Liga cada consumo que genera un paquete con la fila del cargo del paquete
-- (detalle_consumo_quirugicos.id donde id_paquete no es NULL). Asi, si el mismo
-- paquete se aplica dos veces a una cuenta, cada aplicacion se distingue y al
-- eliminar una solo se eliminan sus propios consumos.
ALTER TABLE `detalle_consumo_medicamentos` ADD COLUMN `id_cargo_paquete` INT NULL;
ALTER TABLE `detalle_consumo_comunes`      ADD COLUMN `id_cargo_paquete` INT NULL;
ALTER TABLE `detalle_consumo_quirugicos`   ADD COLUMN `id_cargo_paquete` INT NULL;
