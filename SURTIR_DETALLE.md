# Surtir por detalle (línea por línea)

Rama: `surtir-por-detalle` (repos backend y frontend). Node 20.

Permite que farmacia surta cada línea de un pedido de forma individual, aplicando
el traslado real de existencias por línea, en vez de solo cerrar el pedido completo.

---

## Decisión sobre el solapamiento con el `create` (resuelto: Opción A)

### El solapamiento

`POST /pedidos/create` **movía las existencias al momento de crear el pedido**
(bajaba `existencia_actual` y subía `existencia_actual_farmacia` /
`existencia_actual_quirofano` según el radio `picked`). El valor `existencias_actuales`
que manda el front ya venía restado. Mientras tanto, "surtir" (`PUT /pedidos/deactivate`)
solo ponía `pedidos.estado = 0`, sin mover stock.

Si el nuevo endpoint `surtir` también movía stock → **doble movimiento**
(el total general bajaba dos veces y el área subía dos veces).

### Decisión tomada (confirmada por el cliente)

**Opción A: mover el traslado al surtido.**

- `create` **ya NO mueve existencias**: solo crea la cabecera (`pedidos`) y las
  líneas (`detalle_pedidos`), y guarda `destino` en cada línea.
- El traslado real ocurre **al surtir cada línea** en el endpoint nuevo.

Esto sí implicó tocar `create` (autorizado por el cliente para la Opción A). No se
tocó `/pedidos/deactivate`.

---

## Campo nuevo `destino` (detalle_pedidos)

Migración que corre el cliente:

```sql
ALTER TABLE `detalle_pedidos`
  ADD COLUMN `destino` INT(11) NOT NULL DEFAULT 1 AFTER `estado`;
```

Convención: **1 = enfermería** (`existencia_actual_farmacia`),
**2 = quirófano** (`existencia_actual_quirofano`).

- Modelo `models/enfermeria/detalle_pedidos.js`: `destino` INTEGER, `allowNull: false`,
  `defaultValue: 1`.
- `create` de `pedidosController.js`: guarda `destino` por línea, derivado del radio
  `picked` de enfermería → `destino = parseInt(picked) === 1 ? 2 : 1`
  (picked 0 = farmacia → 1, picked 1 = quirófano → 2).
- **No se tocó el formulario de enfermería**: ya enviaba `picked`, así que el backend
  deriva `destino` solo. No existe ni se creó ninguna columna
  `existencia_actual_enfermeria`.

---

## Endpoint nuevo

`POST /detallePedidos/surtir`  →  `detallePedidosController.surtir`

- **Entrada:** `{ id }` (id de la fila de `detalle_pedidos`). Usuario autenticado vía
  middleware `auth` (`req.user`); `detalle_pedidos` no tiene columnas
  `created_by`/`updated_by`, así que no se persiste el usuario.
- Resuelve el tipo de línea: `id_medicamento` (medicamentos), `id_comun` (comunes) o
  `id_quirurgico` (quirurgicos).
- **Traslado:** `existencia_actual -= cantidad`, y según `destino`:
  - `destino 1` → `existencia_actual_farmacia += cantidad`
  - `destino 2` → `existencia_actual_quirofano += cantidad`
- **Marca de surtido:** usa el campo existente `detalle_pedidos.estado`
  (1 = pendiente, 0 = surtido). No se creó ninguna columna extra.
- **Cierre de cabecera:** tras surtir, cuenta las líneas del pedido que siguen en
  `estado: 1`; si no queda ninguna, pone `pedidos.estado = 0` para que salga de los
  listados de pendientes (que filtran `estado: 1`). Responde `pedidoCerrado: true`.

### Validación

Si `existencia_actual < cantidad` **no surte**: hace rollback y responde
`400 { msg: 'Existencia insuficiente para surtir la línea' }`. Nunca deja
existencias en negativo.

### Idempotencia

Si la línea ya está en `estado 0`, el endpoint responde `200` con
`{ yaSurtido: true }` **sin volver a mover existencias**. Un doble click nunca
mueve stock dos veces.

### Transacción y lock

Toda la operación (lectura + validación + updates) va dentro de
`db.sequelize.transaction(async (t) => { ... })` (MySQL/InnoDB). Tanto la línea como
el producto se leen con `lock: t.LOCK.UPDATE` (`SELECT ... FOR UPDATE`), de modo que
dos peticiones concurrentes se serializan: la segunda ve la línea ya en `estado 0` y
cae en la rama idempotente. Si algo falla, se hace rollback automático y no se mueve
nada.

---

## Frontend — `PedidosPendientesParent.vue` (farmacia)

- El modal de detalle ahora surte **línea por línea**: cada fila tiene su botón
  **Surtir** (`POST /detallePedidos/surtir`) con la directiva existente
  `v-anti-doble`.
- Columnas nuevas: **Destino** (Enfermería / Quirófano) y **Surtido**
  (Pendiente / Surtido).
- La línea surtida se refleja al instante (sin recargar todo); el botón de una línea
  ya surtida se oculta.
- Cuando el backend indica `pedidoCerrado`, refresca el listado (`vuetable`) y cierra
  el modal, de modo que el pedido sale de pendientes.
- Se **reutiliza** el endpoint existente `GET /detalle_pedidos/getByAccount` para
  listar las líneas del pedido (no se creó otro).
- Se quitó el botón único "Surtir" del pie del modal (que llamaba a
  `/pedidos/deactivate`); ese endpoint **no** se modificó.

---

## Verificación

- Backend: carga sin errores (`node --check` de controllers/rutas/modelo OK; los
  modelos y controllers se cargan y `surtir`/`create` quedan como funciones; el
  modelo `detalle_pedidos` expone el atributo `destino`).
- Frontend: `npm run build` con Node 20 → **DONE Build complete** (lint del
  pre-commit en verde).

## Hashes de commits

Backend (`backend-hospital-nuevo`, rama `surtir-por-detalle`):
- `cf4a2da` — detalle_pedidos: agregar campo destino (+ este documento)
- `58fe8f2` — endpoint POST /detallePedidos/surtir + create sin mover stock
- (este documento final se agrega en un commit adicional)

Frontend (`frontend-hospital-nuevo`, rama `surtir-por-detalle`):
- `072c65f` — PedidosPendientesParent: surtir por línea con destino y anti-doble

---

## Notas

- Cambios de config locales (`config/config.json` en backend, `src/config/constant.js`
  en frontend) se dejaron **sin commitear** a propósito.
- No se tocó main ni otras ramas; no hay merge.
