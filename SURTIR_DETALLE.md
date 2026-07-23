# Surtir por detalle (línea por línea)

Documento de trabajo de la rama `surtir-por-detalle`.

## ⚠️ SOLAPAMIENTO DETECTADO CON EL `create` DE PEDIDOS (BLOQUEANTE)

**Estado: pendiente de decisión del cliente. NO se ha tocado la lógica de `create`.**

### Qué pasa hoy

El endpoint `POST /pedidos/create` (`controllers/enfermeria/pedidosController.js`)
**ya realiza el traslado completo de existencias en el momento de crear el pedido**,
para cada línea, según el radio `picked` (0 = farmacia, ≠0 = quirófano):

```js
// dentro de create(), por cada detalle:
Medicamento.update({
  existencia_actual: detalles[i].existencias_actuales, // valor YA restado
  existencia_actual_farmacia: med.existencia_actual_farmacia + cantidad // si picked===0
  // ó existencia_actual_quirofano += cantidad  (si picked !== 0)
})
```

El valor `existencias_actuales` que manda el front **ya viene restado**
(`PedidosMedicamento.vue`, `addNewMed`):

```js
existencias_actuales: parseInt(medicine_.existencias_actuales) - parseInt(cantidad)
```

Por lo tanto, al **crear** el pedido:
- `existencia_actual` (total general) **baja** en `cantidad`.
- `existencia_actual_farmacia` / `existencia_actual_quirofano` **sube** en `cantidad`.

**El traslado ya ocurrió al crear.**

### Qué hace hoy "surtir"

`PUT /pedidos/deactivate` **solo** pone `pedidos.estado = 0`. **No mueve existencias.**
Es decir, "surtir" hoy es únicamente una marca de estado; el inventario ya se movió al crear.

### El conflicto

El pedido de esta tarea es que el nuevo endpoint `surtir` haga el traslado real
(`existencia_actual -= cantidad`, `destino += cantidad`). Pero como el `create`
**ya movió** ese mismo stock, si `surtir` también lo mueve habría **DOBLE MOVIMIENTO**
(el total general bajaría dos veces y el área subiría dos veces).

### Opciones

- **Opción A — Mover el traslado al surtido (diseño limpio):** quitar del `create`
  el movimiento de existencias (que `create` solo cree cabecera + líneas), y que el
  nuevo endpoint `surtir` haga el traslado real línea por línea. **Requiere tocar la
  lógica de `create`**, que se pidió no cambiar sin confirmación previa.

- **Opción B — `surtir` sin mover stock:** dejar `create` como está (mueve al crear)
  y que `surtir` solo marque `detalle_pedidos.estado = 0` por línea (equivalente a
  `deactivate` pero por línea). Sin doble movimiento, pero `surtir` **no** es un
  traslado real; contradice el modelo "surtir es un traslado".

**Se consultó al cliente antes de implementar la parte de existencias.**

---

## Endpoint nuevo

_(pendiente de completar tras la decisión)_

## Idempotencia y transacción

_(pendiente)_

## Hashes de commits

_(pendiente)_
