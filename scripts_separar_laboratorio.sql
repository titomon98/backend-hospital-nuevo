-- Cuentas del hospital que pueden traer laboratorio sumado (version anterior:
-- el egreso y el pago de cuenta parcial sumaban los examenes abiertos al total).
--
-- SOLO CONSULTA. No hay correccion automatica: la fecha de egreso se captura a
-- veces despues y con fecha anterior, asi que no se puede saber por fechas que
-- laboratorio entro al total; y una correccion repetida restaria dos veces.
--
-- Como usarlo: para cada fila, compare total_hospital_segun_cuenta con el
-- "TOTAL HOSPITALIZACION" del PDF de cuenta total. Si la diferencia es igual a
-- laboratorio_abierto, la cuenta lo trae sumado y se corrige UNA vez con:
--   UPDATE cuentas
--   SET total = <total - laboratorio>, pendiente_de_pago = GREATEST(0, pendiente_de_pago - <laboratorio>)
--   WHERE id = <id> AND total = <total actual>;
--   COMMIT;

SELECT c.id, e.expediente, e.nombres, e.apellidos, c.estado, c.fecha_egreso,
       c.total, c.pendiente_de_pago,
       (SELECT COALESCE(SUM(h.total), 0) FROM detalle_honorarios h
         WHERE h.id_cuenta = c.id AND h.estado <> 100) AS honorarios,
       c.total - (SELECT COALESCE(SUM(h.total), 0) FROM detalle_honorarios h
         WHERE h.id_cuenta = c.id AND h.estado <> 100) AS total_hospital_segun_cuenta,
       (SELECT COALESCE(SUM(er.total), 0) FROM lab_cuentas l
          JOIN examenes_realizados er ON er.id_cuenta = l.id
         WHERE l.id_expediente = c.id_expediente AND l.estado = 1) AS laboratorio_abierto
FROM cuentas c
JOIN expedientes e ON e.id = c.id_expediente
WHERE c.estado IN (1, 10) AND c.fecha_egreso IS NOT NULL
  AND COALESCE(c.pagado_laboratorio, 0) = 0
HAVING laboratorio_abierto > 0
ORDER BY c.fecha_egreso DESC;
