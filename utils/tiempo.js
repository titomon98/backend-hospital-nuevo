'use strict';

/**
 * Estandarizacion de horario para el calculo de horas de habitacion.
 *
 * Guatemala es GMT-6 y NO observa horario de verano.
 *
 * Como se guardan en `detalle_habitaciones` (verificado contra produccion,
 * cuyo proceso de Node corre en America/Guatemala):
 *   - `ingreso`: UTC REAL. Las rutas de ingreso lo escriben con new Date(...)
 *     (p.ej. las 08:20 GT quedan como 14:20).
 *   - `salida`: wall-clock de Guatemala escrito tal cual sobre UTC (lo escribe
 *     desdeFormulario; p.ej. las 22:00 GT quedan como 22:00).
 *
 * Todos los calculos trabajan en el marco "wall-clock GT anclado a UTC": se leen
 * con getUTC.../setUTC... y se comparan con getTime(), sin depender de la zona
 * del proceso. Por eso el ingreso se convierte a ese marco con ingresoDesdeBD,
 * y la salida y ahora() ya vienen en el.
 */

const OFFSET_GT_MS = 6 * 60 * 60 * 1000;

// `salida` guardada en la BD (ya es wall-clock GT sobre UTC): se usa tal cual.
const desdeBD = (valor) => new Date(valor);

// `ingreso` guardado en la BD (UTC real) -> wall-clock GT sobre UTC (-6h).
const ingresoDesdeBD = (valor) => new Date(new Date(valor).getTime() - OFFSET_GT_MS);

// "Ahora" en wall-clock de Guatemala, anclado a UTC (misma convencion que la BD).
const ahora = () => {
  const s = new Date().toLocaleString('sv-SE', { timeZone: 'America/Guatemala' });
  return new Date(s.replace(' ', 'T') + 'Z');
};

// Fecha/hora que el usuario teclea en el formulario de egreso, en hora GT-6.
// Se ancla a UTC agregando 'Z' para que no dependa de la zona del proceso.
// Si no hay fecha devuelve `ahora()`; si no hay hora usa el corte de las 14:00.
const desdeFormulario = (fecha, hora) => {
  if (!fecha) return ahora();
  let h = hora || '14:00:00';
  if (h.length === 5) h = `${h}:00`; // "16:00" -> "16:00:00"
  return new Date(`${fecha}T${h}Z`);
};

module.exports = { desdeBD, ingresoDesdeBD, ahora, desdeFormulario };
