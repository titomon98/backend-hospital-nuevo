-- Separa el laboratorio de las cuentas del hospital ya existentes.
--
-- Antes, al egresar (egreso normal / egreso de emergencia) o al pagar una cuenta
-- parcial, los examenes de laboratorio abiertos se sumaban a cuentas.total. Desde
-- este cambio los examenes viven solo en lab_cuentas y se cobran en la caja del
-- laboratorio, asi que a las cuentas del hospital aun abiertas se les resta el
-- laboratorio que se les habia sumado.
--
-- Correr UNA sola vez, justo despues de desplegar el backend nuevo.
-- Paso 1 y 2 solo consultan. Paso 3 modifica (dentro de una transaccion).

-- ============================================================================
-- Paso 1. Laboratorio que entro a cada cuenta del hospital abierta.
--   - Cuentas por cobrar (estado 1) ya egresadas, y cuentas parciales (estado 10).
--   - Solo cuentas sin laboratorio cobrado en la caja del hospital (ver paso 2).
--   - lab_cuentas de la misma admision (desde fecha_ingreso_reciente), creadas a
--     mas tardar el dia del egreso / pago parcial, que seguian abiertas en ese
--     momento (siguen abiertas, o se cobraron en el laboratorio ese dia o despues).
--   lab_cuentas.createdAt y fecha_corte estan en hora de Guatemala.
-- ============================================================================
DROP TEMPORARY TABLE IF EXISTS lab_en_cuenta;
CREATE TEMPORARY TABLE lab_en_cuenta AS
SELECT c.id AS id_cuenta,
       c.id_expediente,
       c.estado,
       c.total,
       c.pendiente_de_pago,
       COALESCE(c.fecha_egreso, DATE(DATE_SUB(c.updatedAt, INTERVAL 6 HOUR))) AS fecha_corte_cuenta,
       SUM(er.total) AS laboratorio
FROM cuentas c
JOIN expedientes e ON e.id = c.id_expediente
JOIN lab_cuentas l
  ON l.id_expediente = c.id_expediente
 AND l.estado IN (0, 1)
 AND (e.fecha_ingreso_reciente IS NULL OR l.createdAt >= e.fecha_ingreso_reciente)
 AND l.createdAt < DATE_ADD(COALESCE(c.fecha_egreso, DATE(DATE_SUB(c.updatedAt, INTERVAL 6 HOUR))), INTERVAL 1 DAY)
 AND (l.estado = 1 OR DATE(l.fecha_corte) >= COALESCE(c.fecha_egreso, DATE(DATE_SUB(c.updatedAt, INTERVAL 6 HOUR))))
JOIN examenes_realizados er ON er.id_cuenta = l.id
WHERE ((c.estado = 1 AND c.fecha_egreso IS NOT NULL) OR c.estado = 10)
  AND COALESCE(c.pagado_laboratorio, 0) = 0
GROUP BY c.id, c.id_expediente, c.estado, c.total, c.pendiente_de_pago, fecha_corte_cuenta
HAVING SUM(er.total) > 0;

-- Revisar: cuenta, paciente, total actual, laboratorio a quitar y como quedaria.
SELECT t.id_cuenta, x.expediente, x.nombres, x.apellidos, t.estado, t.fecha_corte_cuenta,
       t.total AS total_actual, t.laboratorio AS laboratorio_a_quitar,
       GREATEST(0, t.total - t.laboratorio) AS total_nuevo,
       t.pendiente_de_pago AS pendiente_actual,
       GREATEST(0, t.pendiente_de_pago - t.laboratorio) AS pendiente_nuevo
FROM lab_en_cuenta t
JOIN expedientes x ON x.id = t.id_expediente
ORDER BY t.fecha_corte_cuenta DESC;

-- ============================================================================
-- Paso 2. Cuentas donde el laboratorio YA se cobro en la caja del hospital
-- (cobro anterior). No se tocan: sus lab_cuentas siguen abiertas en la caja del
-- laboratorio y habria que cerrarlas a mano para no cobrarlas dos veces.
-- ============================================================================
SELECT c.id AS id_cuenta, x.expediente, x.nombres, x.apellidos, c.estado, c.total, c.pagado_laboratorio
FROM cuentas c
JOIN expedientes x ON x.id = c.id_expediente
WHERE c.estado IN (1, 10) AND COALESCE(c.pagado_laboratorio, 0) > 0;

-- ============================================================================
-- Paso 3. Aplicar (revisar el paso 1 antes). Si algo no cuadra: ROLLBACK.
-- ============================================================================
START TRANSACTION;

UPDATE cuentas c
JOIN lab_en_cuenta t ON t.id_cuenta = c.id
SET c.total = GREATEST(0, c.total - t.laboratorio),
    c.pendiente_de_pago = GREATEST(0, c.pendiente_de_pago - t.laboratorio)
WHERE c.total = t.total;  -- solo si el total no cambio desde el paso 1

SELECT ROW_COUNT() AS cuentas_corregidas;

-- COMMIT;    -- descomentar para confirmar
-- ROLLBACK;  -- o para deshacer
