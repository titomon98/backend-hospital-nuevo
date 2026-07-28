# Cobro de paquetes como cargo único — IMPLEMENTADO (rama paquetes-nuevo)

> Feature: cobrar un **paquete** (paquetes + detalle_paquetes) como **un solo cargo**
> a la cuenta, tratado como un consumo de material quirúrgico.
> Diseño confirmado por el cliente (Opción A) e implementado.

## Migración a correr (raw SQL, la corre el cliente)

```sql
ALTER TABLE `detalle_consumo_quirugicos`
  MODIFY COLUMN `id_quirurgico` INT(11) NULL,
  ADD COLUMN `id_paquete` INT(11) NULL AFTER `id_quirurgico`;
```

## Decisiones confirmadas e implementación

1. **Cargo del paquete (Opción A)**: fila en `detalle_consumo_quirugicos` con
   `id_paquete` seteado, `id_quirurgico` NULL, `descripcion = 'Paquete: <nombre>'`,
   `cantidad = 1`, `precio_venta = total = paquetes.total`. Se suma a `cuentas.total`.
   Aparece en el sumario/historial (LEFT JOIN, se suma por `total`).
2. **Items del paquete**: se crea fila de consumo en **Q0** en su tabla de consumo
   correspondiente (`Incluido en paquete: <nombre>`) y se descuenta de
   `existencia_actual_quirofano` **solo lo realmente consumido** (medicamentos siempre
   inventariados; comun/quirurgico según `inventariado`).
3. **Excedente**: si se consume más que lo incluido, la diferencia se cobra a
   `producto.precio_venta` (precio normal), fila `Excedente de paquete: <nombre>`.
4. **Área/movimiento**: siempre quirófano (`existencia_actual_quirofano`).
5. **Reposición**: UN solo pedido con todas las líneas del paquete (cantidad real
   consumida, solo inventariados), destino quirófano, reusando `crearPedido`.
6. **Endpoint**: `POST /paquetes/aplicarACuenta` (`paquetesController.aplicarACuenta`),
   todo en una transacción con lock. Front: `Quirofano.vue` (setPaquete marca el
   paquete; onSave llama a `aplicarPaquete`).

## Riesgos de Opción A — resueltos

- `consumoQuirurgicosController.get` (lista por área) usa `required: true` + filtra
  `descripcion LIKE %area%`: el cargo del paquete (descripción "Paquete: …") no matchea
  y queda fuera de esa lista operativa. Correcto (no es un ítem de área).
- El **sumario/historial** de la cuenta suma por `item.total` (no accede a
  `quirurgico.nombre`), así que incluye el cargo del paquete sin romper.
- `reportesFarmaciaController.getProductosMasUtilizados`: se agregó filtro
  `id_quirurgico != NULL` para no contar el cargo del paquete como producto.

## Notas / pendientes menores

- Las filas de items en Q0 aparecen en el historial con total 0 (traza), como se pidió.
- El cálculo usa `restarHoras(new Date(), 6)` para las fechas de consumo (mismo criterio
  que los consumos existentes).

---
---

# (Análisis original)

## Hallazgos del código (lo que hay hoy)

- **Cuenta / historial**: el historial y el sumario de una cuenta se arman **solo**
  desde las tres tablas `detalle_consumo_medicamentos` / `detalle_consumo_comunes` /
  `detalle_consumo_quirugicos` (más habitaciones, honorarios, sala de operaciones,
  exámenes). `detalle_cuentas` **NO** se usa para consumos. El monto de la cuenta
  vive en `cuentas.total` y cada consumo hace `cuenta.total += cantidad * precio_venta`.
- **Consumo individual** (`consumo{Medicamentos,Comun,Quirurgicos}Controller.create`):
  1) descuenta existencia del área (`SALIDAQ` → `existencia_actual_quirofano`, resto →
  `existencia_actual_farmacia`); 2) suma a `cuentas.total`; 3) crea la fila en
  `detalle_consumo_*`; 4) (ya implementado) genera un **pedido automático de
  reposición** a farmacia vía `crearPedidoAutomatico`. Los NO INVENTARIADOS no
  descuentan existencia ni generan pedido.
- **Quirófano.vue**: hoy `setPaquete()` toma `detalle_paquetes` del paquete y **precarga
  cada item en `consumosTemporales`**; al guardar, cada item se manda a
  `/detalle_consumo_*/create` (o sea, se cobra individualmente). El movimiento usado es
  siempre `SALIDAQ` (quirófano). El precio precargado por item es `subtotal / cantidad`
  del detalle_paquete (no el precio real del producto).
- `detalle_paquetes` tiene: `cantidad`, `descripcion`, `subtotal`, `id_medicamento` |
  `id_comun` | `id_quirurgico`, `id_paquete`. El campo `pertenencia` existe pero **no se
  llena** (unused). Lo anestésico se sabe por `medicamentos.anestesico`, no por el paquete.
- Los tres modelos de producto tienen `precio_venta` (para el cobro del extra a precio normal).

## 1) Cómo representar el "cargo por paquete" en la cuenta

**Opción A (recomendada) — reusar `detalle_consumo_quirugicos` con `id_paquete` nullable.**
- Migración: `id_quirurgico` pasa a **nullable** y se agrega `id_paquete INT NULL`.
- El cargo del paquete = **una fila** en `detalle_consumo_quirugicos`:
  `id_paquete = X`, `id_quirurgico = NULL`, `descripcion = 'Paquete: <nombre>'`,
  `cantidad = 1`, `precio_venta = paquetes.total`, `total = paquetes.total`, `estado = 1`.
- Ventaja: aparece **automáticamente** en `cuentas.total`, en el historial y en el sumario
  (esos usan LEFT JOIN con Quirurgico y leen `descripcion` de la propia fila), sin tocar
  esos endpoints. Es "tratarlo como un consumo quirúrgico más".
- **Riesgos a resolver** (los detecté, hay que atenderlos en la implementación):
  - `consumoQuirurgicosController.get` (lista de quirúrgicos en Quirófano.vue,
    `/detalle_consumo_quirugicos/list/:id/:area`) hace `include Quirurgico { required: true }`
    (INNER JOIN) → **excluiría** la fila del paquete de esa tabla. Hay que decidir si la
    fila del paquete se muestra ahí (cambiar a LEFT JOIN / manejar `nombre` nulo) o si se
    muestra en otro lugar.
  - `reportesFarmaciaController` (productos más utilizados, etc.) recorre
    `detalle_consumo_quirugicos` y agrupa por producto; una fila con `id_quirurgico` nulo
    hay que ignorarla o contemplarla para que no rompa.

**Opción B — tabla nueva `detalle_consumo_paquetes`** (`id_paquete`, `id_cuenta`,
`descripcion`, `cantidad`, `precio_venta`, `total`, `estado`, timestamps).
- Más limpia conceptualmente (sin FK nulo), pero **hay que tocar cada endpoint** de
  historial/sumario/hoja de emergencia/cuenta parcial/reportes/PDFs para incluir y sumar
  esta tabla dentro de la sección de quirúrgicos. Más superficie y más riesgo de olvidar
  un lugar. Va en contra de "reuse over create".

→ **Recomiendo Opción A.** Necesito tu OK porque implica volver `id_quirurgico` nullable.

## 2) Descuento de existencias de cada item real consumido

- Se descuenta **solo lo realmente consumido** (lo que confirme enfermería en el modal),
  no lo que dice el paquete:
  - **Igual**: se descuenta la cantidad del paquete.
  - **Menos**: se descuenta la cantidad real (menor). El paquete se cobra igual (Regla 2).
  - **Más**: se descuenta la cantidad real; la parte que excede al paquete se maneja como
    consumo extra (ver punto 3).
- El descuento sigue el patrón actual: área `SALIDAQ` → `existencia_actual_quirofano`,
  respetando el guard de NO INVENTARIADO (esos no descuentan ni generan pedido).
- Estos consumos de items del paquete **no se cobran** (no suman a `cuentas.total`) pero
  **sí se registran** y **sí generan pedido pendiente** de reposición.
  - Propuesta: registrar cada item del paquete en su `detalle_consumo_*` con `total = 0`
    y `precio_venta = 0` (o un flag "incluido en paquete"), estado 1, para trazabilidad e
    inventario, sin afectar `cuentas.total`. **(Pregunta 2 abajo: ¿lo querés así, con
    líneas en Q0, o preferís que NO se cree fila de consumo y solo se descuente
    existencia + pedido?)**
  - Los pedidos pendientes: reusar `crearPedido` (helper multi-línea ya existente) para
    generar **un solo pedido** con todas las líneas de los items del paquete, o
    `crearPedidoAutomatico` por item. **(Pregunta 5.)**

## 3) Consumo extra (se consumió más de lo incluido)

- Por cada item cuya cantidad real > cantidad del paquete, la diferencia se cobra como
  **consumo individual normal**, reusando el flujo existente
  (`/detalle_consumo_*/create`): descuenta existencia del excedente, suma a `cuentas.total`
  y genera su pedido. Es un cargo aparte del paquete.
- **Precio del excedente**: debe ser el **precio normal del producto**
  (`producto.precio_venta`), no el precio derivado del paquete (`subtotal/cantidad`).
  **(Pregunta 3: confirmar que el excedente va a `producto.precio_venta`.)**

## 4) Impacto en reportes / historial

- Con Opción A el cargo del paquete aparece dentro de "Consumo Quirúrgicos" del
  historial/sumario y en `cuentas.total` sin cambios extra.
- Ajustes necesarios: `consumoQuirurgicosController.get` (INNER JOIN, ver riesgo arriba) y
  `reportesFarmaciaController` (ignorar filas con `id_quirurgico` nulo). El reporte de
  pedidos surtidos (feature previa) no se ve afectado.
- Las líneas de items del paquete en Q0 aparecerían en el historial con total 0 (si se
  elige registrarlas). Depende de la Pregunta 2.

## Preguntas a confirmar antes de programar

1. **Representación del cargo**: ¿Opción A (reusar `detalle_consumo_quirugicos` +
   `id_paquete` nullable, `id_quirurgico` nullable) — recomendada — u Opción B (tabla nueva)?
2. **Items del paquete**: ¿se crean filas de consumo en Q0 (trazabilidad, aparecen en
   historial en Q0) o **no** se crea fila de consumo y solo se descuenta existencia +
   pedido pendiente?
3. **Precio del excedente** (Regla 3): ¿`producto.precio_venta` (precio normal)? confirmar.
4. **Área/movimiento**: ¿siempre `SALIDAQ` (quirófano) como hoy en Quirófano.vue?
5. **Pedidos de reposición**: ¿un solo pedido con todas las líneas del paquete, o un
   pedido por item? (los NO INVENTARIADOS no generan pedido, igual que hoy).
6. **Nombre del endpoint**: propongo `POST /paquetes/aplicarACuenta` (una transacción que
   hace: cargo del paquete + consumos de items + excedentes + pedidos). ¿OK?

**Detengo aquí. Espero tu confirmación de estos 6 puntos para implementar en la rama
`paquetes-nuevo` (desde main).**
