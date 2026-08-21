# Plan de normalización de zona horaria (GT-6)

## Por qué NO se hizo en un solo barrido
El sistema mezcla dos convenciones para guardar fechas, y **algunas se
"compensan" con cómo las lee el frontend**. Cambiar el backend sin cambiar el
read (y sin migrar los datos viejos) rompería funcionalidades. Ejemplo real:

- Los consumos guardan `createdAt: restarHoras(new Date(), 6)` (hora-pared GT-6).
- El frontend los lee **crudos**: `getRowClass` hace `createdAt.split(' ')[1]` y
  parte la hora para pintar filas día/noche (7am–7pm). Espera GT-6.
- Si "normalizo" ese `createdAt` a UTC, se rompe el coloreo día/noche y las horas
  mostradas se corren 6h.

Por eso un `find & replace` global de `restarHoras(...,6)` es peligroso.

## Convención objetivo (recomendada)
1. **Guardar SIEMPRE en UTC** los timestamps (dejar que Sequelize maneje
   `createdAt`/`updatedAt`; no pasarlos a mano).
2. **Convertir a GT-6 solo al mostrar**, usando helpers (`utils/tiempo.js`,
   `gtaUtc`/`utcAGt`) en backend y un helper único en frontend (p. ej. siempre
   `moment(x).utcOffset(-6)` en vez de leer strings crudos).
3. **Campos de negocio** (`fecha_ingreso`, `hora_ingreso`, `fecha_ingreso_reciente`,
   `primer_ingreso`) también en UTC, ajustando cada comparación y cada display.

## Inventario a migrar (auditoría 2026-08-21)
19 overrides de `createdAt/updatedAt` con `restarHoras(...,6)` en 9 controllers:
`voucher_honorariosController`, `detalleHonorariosController`,
`consumoMedicamentosController`, `consumosBatchController`, `expedientesController`,
`consumoComunController`, `habitacionesController`, `consumoQuirurgicosController`,
`servicioSalaOperacionesController`. Más los campos de negocio dispersos.

Cada uno requiere revisar **su sitio de lectura** antes de cambiarlo.

## Sitios de lectura sensibles (romper si se cambia el storage sin tocarlos)
- Frontend `getRowClass` (día/noche) — lee `createdAt` crudo GT-6.
  Presente en: `PacientesHistorial.vue`, `Hospitalizacion.vue`, y hermanos.
- Cálculo de cobro de habitación en `egresoNormal`/`egresoEmergencia` — usa
  `tiempo.desdeBD(ingreso)` sobre `detalle_habitaciones.ingreso`.
- Filtro de cuentas de lab por `createdAt >= fecha_ingreso_reciente`
  (compara UTC vs GT-6; hoy sesgado a inclusión, no subcobra).

## Fases sugeridas (con pruebas en cada una)
1. **Auditoría de lecturas**: mapear cada campo fecha → todos sus displays y
   comparaciones (backend y frontend). Sin esto no se toca nada.
2. **Helper único de display en frontend** y reemplazar lecturas crudas
   (`.split(' ')`, `moment(x)` naive) por ese helper.
3. **Migrar storage a UTC** controller por controller (empezando por audit
   `updatedAt`, el de menor lectura), regenerando datos con un `ALTER`/UPDATE
   de +6h SOLO en las columnas que estaban guardadas en GT-6.
4. **Campos de negocio** al final, con migración de datos coordinada.
5. **Regresión completa** en entorno de pruebas (ingreso→consumo→egreso→cobro,
   reportes, coloreo día/noche, laboratorio).

## Ya corregido (seguro, sin efectos colaterales)
- Historial de eliminaciones (`logs_eliminacion_pacientes`) → Sequelize/UTC.
- Laboratorio: `updatedAt` de `examenes_realizados`, `lab_cuentas` y
  `detalle_examen_realizado` → UTC (no se leen crudos en GT-6).

## FASE 1 — HECHA (frontend, sin riesgo de datos)
Auditoría:
- Todas las columnas de fecha revisadas son `datetime` (MySQL no las convierte;
  Sequelize con connection tz +00:00 las lee como UTC).
- El coloreo día/noche estaba DUPLICADO en 11 vistas (`getRowClass`), leyendo la
  fecha CRUDA (`.split(' ')`) sobre distintos campos: `createdAt`,
  `fecha_consumo`, `fecha_honorario`, `ingreso`.

Entregado:
- `frontend-hospital-nuevo/src/config/fechas.js` con `horaGTde` y
  `claseFilaDiaNoche` (PUNTO ÚNICO de conversión para display).
- Las 11 vistas ahora llaman al helper (refactor 1:1, sin cambio de
  comportamiento). Único lugar a tocar cuando se migre el storage a UTC.
- Nota: el helper vive en `src/config/` (no `src/utils/`) porque webpack de
  este proyecto no resuelve `src/utils/`.

## Próximo (Fase 2, requiere pruebas)
- Añadir a `src/config/fechas.js` helpers de display de fecha/hora y reemplazar
  las lecturas naive (`moment(x)` / `.split(' ')`) restantes.
- Recién entonces migrar el storage a UTC controller por controller + UPDATE de
  datos (+6h SOLO en columnas que hoy guardan GT-6), con regresión completa.
