'use strict'
const db = require("../../models");
const Cuenta = db.cuentas;
const MovMedicamento = db.detalle_consumo_medicamentos;
const MovQuirurgico = db.detalle_consumo_quirugicos;
const MovComun = db.detalle_consumo_comunes;
const Medicamento = db.medicamentos;
const Quirurgico = db.quirurgicos;
const Comun = db.comunes;
const { crearPedido } = require('../enfermeria/pedidosController');

const restarHoras = (fecha, horas) => {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setHours(nuevaFecha.getHours() - horas);
    return nuevaFecha;
};

const AREAS = {
    SALIDAQ: 'Quirofano',
    SALIDAH: 'Hospitalizacion',
    SALIDAI: 'Intensivo',
    SALIDAE: 'Emergencia',
};

module.exports = {
    // Guarda MUCHOS consumos (medicamentos/anestesicos, quirurgicos y comunes) en
    // UNA sola transaccion: inserta todos, descuenta existencias, actualiza el
    // total de la cuenta una sola vez y genera UN solo pedido de reposicion con
    // todas las lineas (en vez de N requests + N pedidos).
    async create(req, res) {
        const form = req.body.form || {};
        const { id_cuenta, movimiento, user, consumos } = form;

        if (!id_cuenta || !Array.isArray(consumos) || consumos.length === 0) {
            return res.status(400).json({ msg: 'Datos incompletos: se requiere id_cuenta y consumos' });
        }

        const area = AREAS[movimiento] || '';
        // SALIDAQ = Quirofano; el resto descuenta de farmacia.
        const columnaExistencia = movimiento === 'SALIDAQ'
            ? 'existencia_actual_quirofano'
            : 'existencia_actual_farmacia';

        const t = await db.sequelize.transaction();
        try {
            const cuenta = await Cuenta.findOne({
                where: { id: id_cuenta, estado: 1 },
                transaction: t,
            });
            if (!cuenta) {
                await t.rollback();
                return res.status(400).json({ msg: 'No se encontró ninguna cuenta activa para este expediente' });
            }
            const numero = cuenta.numero;

            let sumaTotal = 0;
            let unidadesPedido = 0;
            const lineasPedido = [];

            for (const c of consumos) {
                const cantidad = parseFloat(c.cantidad);
                const precio = parseFloat(c.precio_venta);
                const total = cantidad * precio;
                sumaTotal += total;

                const base = {
                    cantidad,
                    precio_venta: precio.toFixed(2),
                    total: total.toFixed(2),
                    estado: 1,
                    id_cuenta,
                    createdAt: restarHoras(new Date(), 6),
                    updatedAt: restarHoras(new Date(), 6),
                    created_by: user,
                };
                const noInventariado = c.inventariado === 'NO INVENTARIADO';

                if (c.tipo === '0' || c.tipo === '3') {
                    await MovMedicamento.create({
                        ...base,
                        id_medicamento: c.id,
                        descripcion: `Consumo de medicamentos por la cuenta ${numero} En el area de ${area}`,
                    }, { transaction: t });
                    await Medicamento.decrement(columnaExistencia, { by: parseInt(cantidad), where: { id: c.id }, transaction: t });
                    lineasPedido.push({ is_medicine: true, id_medicine: c.id, cantidad, nombre: c.nombre });
                    unidadesPedido += parseInt(cantidad);
                } else if (c.tipo === '1') {
                    await MovQuirurgico.create({
                        ...base,
                        id_quirurgico: c.id,
                        descripcion: `Consumo de insumos quirúrgicos por la cuenta ${numero} En el area de ${area}`,
                    }, { transaction: t });
                    // Los NO INVENTARIADOS no descuentan existencia ni generan pedido.
                    if (!noInventariado) {
                        await Quirurgico.decrement(columnaExistencia, { by: parseInt(cantidad), where: { id: c.id }, transaction: t });
                        lineasPedido.push({ is_quirurgico: true, id_quirurgico: c.id, cantidad, nombre: c.nombre });
                        unidadesPedido += parseInt(cantidad);
                    }
                } else if (c.tipo === '2') {
                    await MovComun.create({
                        ...base,
                        id_comun: c.id,
                        descripcion: `Consumo de insumo común por la cuenta ${numero} En el area de ${area}`,
                    }, { transaction: t });
                    if (!noInventariado) {
                        await Comun.decrement(columnaExistencia, { by: parseInt(cantidad), where: { id: c.id }, transaction: t });
                        lineasPedido.push({ is_comun: true, id_comun: c.id, cantidad, nombre: c.nombre });
                        unidadesPedido += parseInt(cantidad);
                    }
                }
            }

            await cuenta.update({ total: parseFloat(cuenta.total || 0) + sumaTotal }, { transaction: t });
            await t.commit();

            // Un solo pedido automatico con todas las lineas inventariadas.
            // Fuera de la transaccion: si falla no revierte los consumos ya guardados.
            if (lineasPedido.length > 0) {
                try {
                    const ahora = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guatemala' }));
                    const dosDigitos = (n) => String(n).padStart(2, '0');
                    const areaCodigo = { SALIDAQ: 'QUIROFANO', SALIDAH: 'HOSPITALIZACION', SALIDAI: 'INTENSIVO', SALIDAE: 'EMERGENCIA' }[movimiento] || 'AUTOMATICO';
                    const codigoPedido = areaCodigo + '-' +
                        dosDigitos(ahora.getDate()) + '-' + dosDigitos(ahora.getMonth() + 1) + '-' + ahora.getFullYear() + '-' +
                        dosDigitos(ahora.getHours()) + '-' + dosDigitos(ahora.getMinutes()) + '-' + dosDigitos(ahora.getSeconds());
                    await crearPedido({
                        codigoPedido,
                        fecha: ahora,
                        id_usuario: req.user ? req.user.user_id : null,
                        cantidadUnidades: unidadesPedido,
                        picked: movimiento === 'SALIDAQ' ? 1 : 0,
                        detalle: lineasPedido,
                    });
                } catch (e) {
                    console.log('Error creando pedido automatico (batch):', e);
                }
            }

            return res.send({ ok: true, guardados: consumos.length });
        } catch (error) {
            await t.rollback();
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error al guardar los consumos' });
        }
    },
};
