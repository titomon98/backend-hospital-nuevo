// Descuento validado (solicitud_descuento = 1) en quetzales. tipo_descuento: 0 = porcentaje
// sobre cuentas.total, 1 = monto fijo en Q. Se resta de la parte de hospital (no de honorarios).
function montoDescuento(cuenta) {
  if (!cuenta || Number(cuenta.solicitud_descuento) !== 1) return 0;
  const valor = parseFloat(cuenta.descuento) || 0;
  const monto = Number(cuenta.tipo_descuento) === 1 ? valor : (parseFloat(cuenta.total) || 0) * valor / 100;
  return Math.round(Math.max(0, monto) * 100) / 100;
}

module.exports = { montoDescuento };
