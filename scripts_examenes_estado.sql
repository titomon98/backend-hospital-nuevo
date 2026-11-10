-- Borrado lógico de exámenes disponibles (laboratorio). Ejecutar una vez.
ALTER TABLE examenes_almacenados
  ADD COLUMN estado INT NOT NULL DEFAULT 1 AFTER tipo_examen;
