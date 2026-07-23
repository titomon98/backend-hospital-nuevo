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

## Endpoint de listado plano

`GET /detalle_pedidos/getPendientes`  →  `detallePedidosController.getPendientes`

- Devuelve **una fila por cada línea pendiente** (`detalle_pedidos.estado = 1`) de
  **todos** los pedidos, no las cabeceras.
- Paginado con la misma forma que espera `vuetable`
  (`{ total, last_page, current_page, from, to, data }`).
- Incluye el `pedido` (para el código) y el producto asociado
  (`medicamento` / `comune` / `quirurgico`).
- Búsqueda por `descripcion` (`Op.like`).

## Frontend — `PedidosPendientesParent.vue` (farmacia)

La vista se reescribió como **lista plana de productos** (a pedido del cliente:
"no sé qué estoy surtiendo"). Ya no muestra cabeceras de pedido ni usa un modal.

- El `vuetable` consume `GET /detalle_pedidos/getPendientes` y muestra directamente
  una fila por producto pendiente, con columnas: **Código de Pedido**, **Producto**,
  **Cantidad**, **Destino** (Enfermería / Quirófano) y **Acción**.
- Cada fila tiene su botón **Surtir** (`POST /detallePedidos/surtir`) con la
  directiva existente `v-anti-doble`.
- Al surtir, la línea deja de estar pendiente (`estado 0`) y **desaparece del
  listado** al refrescar el `vuetable`.
- Se eliminaron el modal, el formulario y el botón único que antes llamaba a
  `/pedidos/deactivate`; ese endpoint **no** se modificó.

### Versión anterior (modal)

La primera iteración usaba el modal existente con `GET /detalle_pedidos/getByAccount`
y surtido por línea dentro del modal. Se reemplazó por la lista plana descrita arriba.

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
- `a902125` — SURTIR_DETALLE.md: documentación
- `d67147c` — endpoint GET /detalle_pedidos/getPendientes (lista plana)
- (actualización final de este documento en un commit adicional)

Frontend (`frontend-hospital-nuevo`, rama `surtir-por-detalle`):
- `072c65f` — PedidosPendientesParent: surtir por línea con destino y anti-doble (modal)
- `321a51a` — PedidosPendientesParent: lista plana de productos por surtir

---

## Notas

- Cambios de config locales (`config/config.json` en backend, `src/config/constant.js`
  en frontend) se dejaron **sin commitear** a propósito.
- No se tocó main ni otras ramas; no hay merge.
