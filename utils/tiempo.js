'use strict';

/**
 * Estandarizacion de horario para el calculo de horas de habitacion.
 *
 * Guatemala es GMT-6 y NO observa horario de verano.
 *
 * En la base, `detalle_habitaciones.ingreso` y `salida` se guardan como el
 * wall-clock de Guatemala escrito tal cual sobre UTC (p.ej. las 20:00 GT
 * quedan como 20:00Z). Para que el calculo de horas de EXACTAMENTE lo mismo
 * sin importar la zona horaria del proceso de Node (UTC, GMT-6, etc.), TODO se
 * ancla a UTC: las fechas se leen con getUTC.../setUTC... y se comparan con
 * getTime(). Asi se elimina la mezcla de UTC y GMT-6 que corrompia los totales.
 *
 * NOTA: este helper NO cambia como se escriben las fechas; solo unifica como se
 * interpretan al calcular horas.
 */

// Fecha ya guardada en la BD (viene como wall-clock-GT sobre UTC): se usa tal cual.
const desdeBD = (valor) => new Date(valor);

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

module.exports = { desdeBD, ahora, desdeFormulario };
