'use strict'
const db = require("../../models");
const Op = db.Sequelize.Op;
const Venta = db.venta_libre_cuentas;
const Detalle = db.venta_libre_detalles;
const Cliente = db.venta_libre_clientes;

const ANULADA = 0, POR_COBRAR = 1, COBRADA = 2;
const COMPRADORES = ['id_expediente', 'id_usuario', 'id_medico', 'id_cliente'];
const METODOS = ['efectivo', 'tarjeta', 'deposito', 'cheque', 'transferencia'];
const TIPO_USUARIO_MEDICO_INTERNO = 11;
// Tipo de linea -> inventario (existencia_actual_farmacia). El servicio (oxigeno) no lleva inventario.
const INVENTARIO = { medicamento: db.medicamentos, anestesico: db.medicamentos, quirurgico: db.quirurgicos, comun: db.comunes };

const INCLUDE_COMPRADOR = [
    { model: db.expedientes, as: 'expediente', attributes: ['id', 'nombres', 'apellidos'] },
    { model: db.usuarios, as: 'usuario', attributes: ['id', 'nombre', 'apellidos'] },
    { model: db.medicos, as: 'medico', attributes: ['id', 'nombre'] },
    { model: Cliente, as: 'cliente', attributes: ['id', 'nombre'] },
];

const error400 = (msg) => Object.assign(new Error(msg), { status: 400 });
const usuarioDe = (req) => req.user?.user ?? req.body.user;
const like = (s) => ({ [Op.like]: `%${s}%` });
const nombreCompleto = (a, b, s) => db.sequelize.where(
    db.sequelize.fn('CONCAT', db.sequelize.col(a), ' ', db.sequelize.fn('COALESCE', db.sequelize.col(b), '')), like(s));

// Corre fn(req, t) en una transaccion y responde su resultado; error400 -> su mensaje.
const conTransaccion = (fn) => async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const resultado = await fn(req, t);
        await t.commit();
        return res.json(resultado);
    } catch (error) {
        await t.rollback();
        if (!error.status) console.log(error);
        return res.status(error.status || 400).json({ msg: error.status ? error.message : 'Ha ocurrido un error, por favor intente más tarde' });
    }
};

function fila(venta) {
    const v = venta.toJSON();
    const [tipo_comprador, comprador] =
        v.expediente ? ['Paciente', `${v.expediente.nombres} ${v.expediente.apellidos || ''}`]
        : v.usuario ? ['Médico interno', `${v.usuario.nombre || ''} ${v.usuario.apellidos || ''}`]
        : v.medico ? ['Médico', v.medico.nombre]
        : ['Cliente externo', v.cliente ? v.cliente.nombre : ''];
    return { ...v, tipo_comprador, comprador: comprador.trim() };
}

// Exactamente un comprador. cliente_nuevo crea (o reusa por nombre) el cliente externo.
async function compradorDe(body, user, t) {
    const comprador = Object.fromEntries(COMPRADORES.map(k => [k, parseInt(body[k]) || null]));
    const nuevo = String(body.cliente_nuevo || '').trim().replace(/\s+/g, ' ').toUpperCase();
    if (nuevo && !comprador.id_cliente) {
        const [cliente] = await Cliente.findOrCreate({
            where: { nombre: nuevo },
            defaults: { created_by: user, updated_by: user },
            transaction: t
        });
        comprador.id_cliente = cliente.id;
    }
    if (COMPRADORES.filter(k => comprador[k]).length !== 1) throw error400('Seleccione un solo comprador');
    return comprador;
}

// Valida las lineas; nombre, precio e inventario salen de la BD, no del navegador.
async function lineasDe(lineas, user, t) {
    if (!Array.isArray(lineas) || !lineas.length) throw error400('Agregue al menos un producto o servicio');
    const filas = [];
    for (const l of lineas) {
        // 2 decimales, igual que la columna: el total se calcula con lo que se guarda.
        const cantidad = Math.round(parseFloat(l.cantidad) * 100) / 100;
        if (!(cantidad > 0)) throw error400('Hay una cantidad inválida');
        let descripcion, precio, inventariado;
        if (l.tipo === 'servicio') {
            const servicio = await db.servicios.findByPk(l.id_item, { transaction: t });
            if (!servicio) throw error400('Servicio no encontrado');
            [descripcion, precio, inventariado] = [servicio.descripcion, parseFloat(servicio.precio), false];
        } else if (INVENTARIO[l.tipo]) {
            const item = await INVENTARIO[l.tipo].findByPk(l.id_item, { transaction: t });
            if (!item) throw error400('Producto no encontrado');
            if (!Number.isInteger(cantidad)) throw error400(`La cantidad de "${item.nombre}" debe ser entera`);
            // medicamentos no tiene la columna inventariado: siempre se descuenta.
            [descripcion, precio, inventariado] = [item.nombre, parseFloat(item.precio_venta), item.inventariado !== 'NO INVENTARIADO'];
        } else {
            throw error400('Tipo de producto inválido');
        }
        precio = precio || 0;
        filas.push({
            tipo: l.tipo, id_item: l.id_item, descripcion, cantidad, precio,
            total: Math.round(cantidad * precio * 100) / 100,
            inventariado, created_by: user, updated_by: user
        });
    }
    return filas;
}

// signo -1 descuenta (falla si no alcanza la existencia), +1 devuelve.
async function moverInventario(filas, signo, t) {
    for (const f of filas) {
        if (!f.inventariado) continue;
        const n = Math.round(Number(f.cantidad));
        const where = { id: f.id_item };
        if (signo < 0) where.existencia_actual_farmacia = { [Op.gte]: n };
        const [afectadas] = await INVENTARIO[f.tipo].update(
            { existencia_actual_farmacia: db.sequelize.literal(`COALESCE(existencia_actual_farmacia, 0) ${signo < 0 ? '-' : '+'} ${n}`) },
            { where, transaction: t }
        );
        if (!afectadas) throw error400(`No hay suficiente existencia de "${f.descripcion}"`);
    }
}

async function guardarLineas(venta, lineas, user, t) {
    const filas = await lineasDe(lineas, user, t);
    await moverInventario(filas, -1, t);
    await Detalle.bulkCreate(filas.map(f => ({ ...f, id_venta_libre: venta.id })), { transaction: t });
    const total = filas.reduce((a, f) => a + f.total, 0);
    await venta.update({ total: total.toFixed(2), updated_by: user }, { transaction: t });
}

// Venta bloqueada para modificar; solo las que siguen por cobrar.
async function ventaPorCobrar(id, t) {
    const venta = await Venta.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!venta) throw Object.assign(new Error('Venta no encontrada'), { status: 404 });
    if (Number(venta.estado) !== POR_COBRAR) throw error400('La venta ya fue cobrada o anulada');
    return venta;
}

async function devolverLineas(venta, t) {
    const anteriores = await Detalle.findAll({ where: { id_venta_libre: venta.id }, transaction: t });
    await moverInventario(anteriores, +1, t);
    return anteriores;
}

// Ventas libres cobradas en `fecha` (YYYY-MM-DD, dia GT) con la forma de las filas del corte de
// caja (listCortesPerDate): todo es de hospital, categoria 'Venta libre'.
async function cobradasDelDia(fecha) {
    const ventas = await Venta.findAll({
        include: INCLUDE_COMPRADOR,
        where: {
            estado: COBRADA,
            [Op.and]: db.sequelize.where(db.sequelize.fn('DATE', db.sequelize.fn('CONVERT_TZ', db.sequelize.col('fecha_cobro'), '+00:00', '-06:00')), fecha)
        },
        order: [['fecha_cobro', 'ASC']]
    });
    return ventas.map(fila).map(v => ({
        id: `VL-${v.id}`,
        numero: `VL-${v.id}`,
        expediente: { expediente: '', nombres: v.comprador, apellidos: `(${v.tipo_comprador})`, medico: null },
        total: v.total,
        total_pagado: v.total,
        pendiente_de_pago: 0,
        total_hospital: Number(v.total).toFixed(2),
        total_honorarios: '0.00',
        total_laboratorio: '0.00',
        categoria: 'Venta libre',
        numero_factura: null,
        createdAt: v.fecha_cobro,
        detalle_pago_cuentas: [{ ...Object.fromEntries(METODOS.map(m => [m, v[m] || 0])), recargoTarjeta: 0, seguro: 0, categoria: 'hospital', total: v.total }]
    }));
}

module.exports = {
    cobradasDelDia,
    // Busqueda de compradores: paciente | medico_interno | medico | cliente -> [{ id, nombre }].
    async personas(req, res) {
        const s = String(req.query.search || '').trim();
        const opciones = { limit: 20, raw: true };
        try {
            let filas;
            switch (req.query.tipo) {
                case 'paciente':
                    filas = (await db.expedientes.findAll({ ...opciones, attributes: ['id', 'nombres', 'apellidos'], where: nombreCompleto('nombres', 'apellidos', s) }))
                        .map(e => ({ id: e.id, nombre: `${e.nombres} ${e.apellidos || ''}`.trim() }));
                    break;
                case 'medico_interno':
                    filas = (await db.usuarios.findAll({ ...opciones, attributes: ['id', 'nombre', 'apellidos'], where: { [Op.and]: [{ id_tipo_usuario: TIPO_USUARIO_MEDICO_INTERNO, estado: 1 }, nombreCompleto('nombre', 'apellidos', s)] } }))
                        .map(u => ({ id: u.id, nombre: `${u.nombre || ''} ${u.apellidos || ''}`.trim() }));
                    break;
                case 'medico':
                    filas = await db.medicos.findAll({ ...opciones, attributes: ['id', 'nombre'], where: { estado: 1, nombre: like(s) } });
                    break;
                case 'cliente':
                    filas = await Cliente.findAll({ ...opciones, attributes: ['id', 'nombre'], where: { nombre: like(s) }, order: [['nombre', 'ASC']] });
                    break;
                default:
                    return res.status(400).json({ msg: 'Tipo de comprador inválido' });
            }
            return res.json(filas);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },

    create: conTransaccion(async (req, t) => {
        const user = usuarioDe(req);
        const comprador = await compradorDe(req.body, user, t);
        const venta = await Venta.create({ ...comprador, total: 0, estado: POR_COBRAR, created_by: user, updated_by: user }, { transaction: t });
        await guardarLineas(venta, req.body.lineas, user, t);
        return { ok: true, id: venta.id, total: venta.total };
    }),

    // ?estado=1|2|0 (opcional) &search &page (1..) &limit
    async list(req, res) {
        const limit = parseInt(req.query.limit) || 10;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const s = String(req.query.search || '').trim();
        const where = {};
        if (req.query.estado !== undefined && req.query.estado !== '') where.estado = parseInt(req.query.estado);
        if (s) {
            where[Op.or] = [
                { id: parseInt(s) || 0 },
                nombreCompleto('expediente.nombres', 'expediente.apellidos', s),
                nombreCompleto('usuario.nombre', 'usuario.apellidos', s),
                { '$medico.nombre$': like(s) },
                { '$cliente.nombre$': like(s) },
            ];
        }
        try {
            const { count, rows } = await Venta.findAndCountAll({
                include: INCLUDE_COMPRADOR, where, order: [['id', 'DESC']], limit, offset: (page - 1) * limit
            });
            return res.json({ total: count, data: rows.map(fila) });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },

    async get(req, res) {
        try {
            const venta = await Venta.findByPk(req.params.id, {
                include: [...INCLUDE_COMPRADOR, { model: Detalle, as: 'detalles' }],
                order: [[{ model: Detalle, as: 'detalles' }, 'id', 'ASC']]
            });
            if (!venta) return res.status(404).json({ msg: 'Venta no encontrada' });
            return res.json(fila(venta));
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },

    // Reemplaza comprador y lineas: devuelve el inventario de las lineas anteriores y descuenta las nuevas.
    update: conTransaccion(async (req, t) => {
        const user = usuarioDe(req);
        const venta = await ventaPorCobrar(req.params.id, t);
        const comprador = await compradorDe(req.body, user, t);
        await devolverLineas(venta, t);
        await Detalle.destroy({ where: { id_venta_libre: venta.id }, transaction: t });
        await venta.update({ ...comprador, updated_by: user }, { transaction: t });
        await guardarLineas(venta, req.body.lineas, user, t);
        return { ok: true, id: venta.id, total: venta.total };
    }),

    // Anula (solo por cobrar) y devuelve lo inventariado.
    anular: conTransaccion(async (req, t) => {
        const venta = await ventaPorCobrar(req.params.id, t);
        await devolverLineas(venta, t);
        await venta.update({ estado: ANULADA, updated_by: usuarioDe(req) }, { transaction: t });
        return { ok: true };
    }),

    // Cobro completo: la suma de los metodos debe ser igual al total.
    cobrar: conTransaccion(async (req, t) => {
        const user = usuarioDe(req);
        const venta = await ventaPorCobrar(req.params.id, t);
        const montos = Object.fromEntries(METODOS.map(m => [m, Math.max(0, parseFloat(req.body[m]) || 0)]));
        const suma = METODOS.reduce((a, m) => a + montos[m], 0);
        if (Math.abs(suma - parseFloat(venta.total)) > 0.005) {
            throw error400(`El pago (Q${suma.toFixed(2)}) debe ser igual al total (Q${parseFloat(venta.total).toFixed(2)})`);
        }
        await venta.update({ ...montos, estado: COBRADA, fecha_cobro: new Date(), cobrado_by: user, updated_by: user }, { transaction: t });
        return { ok: true };
    }),
};
