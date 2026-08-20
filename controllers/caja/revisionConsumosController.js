'use strict'
const db = require('../../models');
const Revision = db.revision_consumos;

// Revisión de los consumos de una cuenta (medicamentos, anestésicos, quirúrgico y
// común). Estado: 1 = comprobado, 2 = inconsistencia reportada. Una revisión por
// cuenta (se actualiza si ya existía). Solo la usan roles 1, 3, 9 y 11 (validado
// también en el front).
module.exports = {
    async set(req, res) {
        const { id_cuenta, estado } = req.body;
        const usuario = (req.user && req.user.user) ? req.user.user : (req.body.user || null);
        if (!id_cuenta || ![1, 2].includes(parseInt(estado))) {
            return res.status(400).json({ msg: 'Datos de revisión inválidos' });
        }
        try {
            const [row] = await Revision.findOrCreate({
                where: { id_cuenta: id_cuenta },
                defaults: { id_cuenta: id_cuenta, estado: parseInt(estado), reviewed_by: usuario }
            });
            await row.update({ estado: parseInt(estado), reviewed_by: usuario });
            return res.json({ id_cuenta: id_cuenta, estado: row.estado, reviewed_by: row.reviewed_by });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },
    // Confirma la cantidad realmente usada de UN consumo. Si difiere de lo
    // registrado es una "inconsistencia": ajusta cantidad/total del consumo,
    // devuelve/descuenta la diferencia en el inventario del area y ajusta el
    // total de la cuenta (si el consumo tiene precio; los de paquete son Q0).
    // Solo roles 1 y 3 pueden modificar la cantidad; 9 y 11 solo confirman igual.
    // Cuando TODOS los consumos de la cuenta quedan confirmados, fija el estado
    // de la revision (1 = comprobado, 2 = inconsistencia).
    async confirmarConsumo(req, res) {
        const Op = db.Sequelize.Op;
        const { id_consumo, tipo, cantidad_real, id_cuenta, movimiento, user, user_type } = req.body;
        const rol = parseInt(user_type);
        if (![1, 3, 9, 11].includes(rol)) {
            return res.status(403).json({ msg: 'No autorizado para revisar consumos' });
        }
        const map = {
            medicamento: { Mov: db.detalle_consumo_medicamentos, Prod: db.medicamentos, idCol: 'id_medicamento', inventariable: false },
            quirurgico:  { Mov: db.detalle_consumo_quirugicos,   Prod: db.quirurgicos,   idCol: 'id_quirurgico',  inventariable: true },
            comun:       { Mov: db.detalle_consumo_comunes,      Prod: db.comunes,       idCol: 'id_comun',       inventariable: true }
        };
        const info = map[tipo];
        if (!info) return res.status(400).json({ msg: 'Tipo de consumo inválido' });
        const columna = movimiento === 'SALIDAQ' ? 'existencia_actual_quirofano' : 'existencia_actual_farmacia';

        const t = await db.sequelize.transaction();
        try {
            const consumo = await info.Mov.findByPk(id_consumo, { transaction: t });
            if (!consumo) { await t.rollback(); return res.status(404).json({ msg: 'Consumo no encontrado' }); }

            const registrada = parseFloat(consumo.cantidad);
            const real = parseFloat(cantidad_real);
            if (isNaN(real) || real < 0) { await t.rollback(); return res.status(400).json({ msg: 'Cantidad real inválida' }); }
            const diff = real - registrada; // >0 uso mas, <0 uso menos

            if (diff !== 0) {
                if (![1, 3].includes(rol)) {
                    await t.rollback();
                    return res.status(403).json({ msg: 'Solo gerencia/administración puede modificar la cantidad' });
                }
                const precio = parseFloat(consumo.precio_venta) || 0;
                const idProd = consumo[info.idCol];

                // ¿El producto lleva inventario? (medicamentos siempre; quirurgico/comun solo INVENTARIADO)
                let ajustaInventario = !info.inventariable;
                if (info.inventariable && idProd) {
                    const prod = await info.Prod.findByPk(idProd, { transaction: t });
                    ajustaInventario = !!(prod && prod.inventariado === 'INVENTARIADO');
                } else if (!info.inventariable) {
                    ajustaInventario = true;
                }

                await consumo.update({
                    cantidad: real,
                    total: (real * precio).toFixed(2),
                    reviewed_by: user,
                    inconsistente: 1
                }, { transaction: t });

                // Ajuste de cobro (solo si el consumo tiene precio; paquete = Q0 no cambia cobro)
                if (precio > 0) {
                    const cuenta = await db.cuentas.findByPk(id_cuenta, { transaction: t, lock: t.LOCK.UPDATE });
                    if (cuenta) {
                        const nuevoTotal = (parseFloat(cuenta.total) || 0) + (diff * precio);
                        await cuenta.update({ total: nuevoTotal.toFixed(2) }, { transaction: t });
                    }
                }

                // Ajuste de inventario: devuelve (registrada-real) si uso menos, descuenta si uso mas.
                if (ajustaInventario && idProd) {
                    await info.Prod.increment(columna, { by: (registrada - real), where: { id: idProd }, transaction: t });
                }
            } else {
                await consumo.update({ reviewed_by: user }, { transaction: t });
            }

            // ¿Todos los consumos de la cuenta confirmados?
            const tablas = [db.detalle_consumo_medicamentos, db.detalle_consumo_quirugicos, db.detalle_consumo_comunes];
            let totalConsumos = 0, revisados = 0, inconsistentes = 0;
            for (const T of tablas) {
                totalConsumos += await T.count({ where: { id_cuenta, estado: 1 }, transaction: t });
                revisados += await T.count({ where: { id_cuenta, estado: 1, reviewed_by: { [Op.ne]: null } }, transaction: t });
                inconsistentes += await T.count({ where: { id_cuenta, estado: 1, inconsistente: 1 }, transaction: t });
            }

            let finalizado = false;
            let estadoFinal = 0;
            if (totalConsumos > 0 && revisados >= totalConsumos) {
                estadoFinal = inconsistentes > 0 ? 2 : 1;
                const [row] = await Revision.findOrCreate({
                    where: { id_cuenta },
                    defaults: { id_cuenta, estado: estadoFinal, reviewed_by: user },
                    transaction: t
                });
                await row.update({ estado: estadoFinal, reviewed_by: user }, { transaction: t });
                finalizado = true;
            }

            await t.commit();
            return res.json({ ok: true, finalizado, estado: estadoFinal, total: totalConsumos, revisados });
        } catch (error) {
            await t.rollback();
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error al confirmar el consumo' });
        }
    },

    async get(req, res) {
        const id_cuenta = req.params.id_cuenta;
        try {
            const row = await Revision.findOne({ where: { id_cuenta: id_cuenta } });
            if (!row) {
                return res.json({ id_cuenta: id_cuenta, estado: 0, reviewed_by: null });
            }
            return res.json({ id_cuenta: id_cuenta, estado: row.estado, reviewed_by: row.reviewed_by });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    }
};
