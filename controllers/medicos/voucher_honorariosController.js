'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Medico = db.medicos;
const Honorarios = db.detalle_honorarios
const Cuentas = db.cuentas
const tipoPago = db.detalle_pago_cuentas
const Expedientes = db.expedientes
const VoucherHonorarios = db.voucher_honorarios;
const Op = db.Sequelize.Op;

module.exports = {
    async create(req, res) {
        let form = req.body
        console.log (form)
        const restarHoras = (fecha, horas) => {
            let nuevaFecha = new Date(fecha);
            nuevaFecha.setHours(nuevaFecha.getHours() - horas);
            return nuevaFecha;
        };
        const datos = {
            id_medico: form.medico.id,
            nombre_medico: form.medico.nombre,
            nit: form.medico.nit,
            cantidad_pagada: form.cantidad,
            fecha_creacion: restarHoras(new Date(), 6),
            createdAt: new Date(),
            updatedAt: restarHoras(new Date(), 6),
            created_by: req.body.user
        };

        await Honorarios.update(
            { 
                estado: 0, 
                updatedAt: restarHoras(new Date(), 6) 
            },
            { 
                where: {
                    id: { [Op.in]: form.id_paciente },
                    id_medico: form.medico.id
                } 
            }
        );

        await VoucherHonorarios.create(datos)
        .then(tipo => {
            res.send(tipo);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    async getSearch(req, res) {
        const restarHoras = (fecha, horas) => {
            let nuevaFecha = new Date(fecha);
            nuevaFecha.setHours(nuevaFecha.getHours() - horas);
            return nuevaFecha;
        };

        const busqueda = req.query.search;
        const condition = busqueda
            ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }], [Op.and]: [{ estado: 1 }] }
            : { estado: 1 };

        try {
            // Si viene fecha del query la usa, si no usa el día actual
            const fechaBase = req.query.fecha ? new Date(req.query.fecha) : restarHoras(new Date(), 6);

            const inicioDia = new Date(fechaBase);
            inicioDia.setHours(0, 0, 0, 0);

            const finDia = new Date(fechaBase);
            finDia.setHours(23, 59, 59, 999);

            const [Medicos, ultimo_id] = await Promise.all([
                Medico.findAll({ where: condition }),
                VoucherHonorarios.findOne({
                    attributes: ['id'],
                    order: [['id', 'DESC']],
                }),
            ]);

            const numero = ultimo_id ? ultimo_id.id + 1 : 1;
            res.json({ Medicos, numero, fechaActual: fechaBase, inicioDia, finDia });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error en getSearch' });
        }
    },

    async getPacientesHonorarios(req, res) {
        const idMedico = req.query.idMedico;
        const fecha = req.query.fecha;

        const [yyyy, mm, dd] = fecha
            ? fecha.split('-').map(Number)
            : [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()];

        const inicioDia = new Date(Date.UTC(yyyy, mm - 1, dd, 6, 0, 0, 0));
        const finDia    = new Date(Date.UTC(yyyy, mm - 1, dd + 1, 5, 59, 59, 999));

        try {
            const pacientes = await Honorarios.findAll({
                where: {
                    id_medico: idMedico,
                    estado: 1,
                    createdAt: { [Op.between]: [inicioDia, finDia] }
                },
                attributes: ['id', 'id_cuenta', 'total', 'lugar', 'createdAt'],
                raw: true,
            });

            if (pacientes.length === 0) {
                return res.json({ pacientes: [], Total: 0 });
            }

            const idsCuentas = pacientes.map((item) => item.id_cuenta);
            const cuentas = await Cuentas.findAll({
                where: { id: { [Op.in]: idsCuentas } },
                attributes: ['id', 'id_expediente'],
                raw: true,
            });

            const idsExpedientes = cuentas.map((cuenta) => cuenta.id_expediente);
            const expedientes = await Expedientes.findAll({
                where: { id: { [Op.in]: idsExpedientes } },
                attributes: ['id', 'nombres', 'apellidos', 'expediente'],
                raw: true,
            });

            const idsMasRecientes = await tipoPago.findAll({
                where: { id_cuenta: { [Op.in]: idsCuentas } },
                attributes: [
                    'id_cuenta',
                    [Sequelize.fn('MAX', Sequelize.col('updatedAt')), 'ultimoPago']
                ],
                group: ['id_cuenta'],
                raw: true,
            });

            const idsFechas = idsMasRecientes.map(item => ({
                id_cuenta: item.id_cuenta,
                updatedAt: item.ultimoPago,
            }));

            const ultimoPagos = await tipoPago.findAll({
                where: {
                    [Op.or]: idsFechas.map(item => ({
                        id_cuenta: item.id_cuenta,
                        updatedAt: item.updatedAt,
                    })),
                },
                attributes: ['id', 'id_cuenta', 'efectivo', 'tarjeta', 'deposito', 'cheque', 'seguro', 'transferencia', 'updatedAt'],
                raw: true,
            });

            const expedientesMap = expedientes.reduce((map, expediente) => {
                map[expediente.id] = expediente;
                return map;
            }, {});

            const tipoPagoMap = ultimoPagos.reduce((map, tipo) => {
                map[tipo.id_cuenta] = tipo;
                return map;
            }, {});

            const pacientesMedico = pacientes.map(detalle => {
                const cuenta = cuentas.find(c => c.id === detalle.id_cuenta);
                const expediente = cuenta ? expedientesMap[cuenta.id_expediente] : null;
                const pago = tipoPagoMap[detalle.id_cuenta] || {};
                const tipoConDinero = ['efectivo', 'tarjeta', 'deposito', 'cheque', 'seguro', 'transferencia']
                    .find(tipo => pago[tipo] > 0) || 'Ninguno';

                return {
                    id: detalle.id,
                    paciente: expediente ? `${expediente.nombres} ${expediente.apellidos}` : 'Desconocido',
                    expediente: expediente ? expediente.expediente : null,
                    lugar: detalle.lugar,
                    total: parseFloat(detalle.total),
                    fecha: detalle.createdAt,
                    tipoPago: tipoConDinero
                };
            });

            const totalHonorarios = pacientesMedico.reduce((sum, p) => sum + p.total, 0);

            res.json({ pacientes: pacientesMedico, Total: totalHonorarios });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener pacientes' });
        }
    }
};

