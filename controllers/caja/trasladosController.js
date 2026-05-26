'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Expediente = db.expedientes;
const Cuenta = db.cuentas;
const Habitaciones = db.habitaciones;
const Medicos = db.medicos
const Logs = db.log_traslados;
const DetalleCuentas = db.detalle_cuentas;
const Op = db.Sequelize.Op;
const DetalleHabitaciones = db.detalle_habitaciones;

const Honorario = db.detalle_honorarios
const Medico = db.medicos

const MovimientoComun = db.detalle_consumo_comunes;
const Comun = db.comunes;

const MovimientoMedicamentos = db.detalle_consumo_medicamentos;
const Medicamento = db.medicamentos;

const MovimientoQuirurgico = db.detalle_consumo_quirugicos;
const Quirurgico = db.quirurgicos;

const Consumo = db.consumos;
const Servicio = db.servicios;

const Examenes = db.examenes_realizados;
const ExamenAlmacenado = db.examenes_almacenados;
const Cuenta_Lab = db.lab_cuentas;

const SalaOperaciones = db.servicio_sala_operaciones;
const Categoria = db.categoria_sala_operaciones;

const Usuario = db.usuarios;
const DetalleHonorarios = db.detalle_honorarios;

module.exports = { 
    async trasladarEmergenciaAHospital(req, res) {
        try {
            const moment = require('moment');

            const dat = [
                'egreso por fallecimiento',
                'Hospitalización',
                'Egreso por alta médica',
                'Quirófano',
                'Cuidados Intensivos',
                'Emergencias',  // índice 5 ← el que aplica
            ];

            // 🔹 PROCESO DE COBRO (cierre de emergencia)
            const logs = await Logs.findAll({
                where: {
                    id_expediente: req.body.id,
                    destino: dat[req.body.estado_anterior], // dat[5] = 'Emergencias'
                },
                order: [['createdAt', 'DESC']],
                limit: 1,
            });

            if (logs.length > 0) {
                const registroMasReciente = logs[0];

                if (!registroMasReciente.id_habitacionDestino) {
                    return res.status(200).json({ msg: 'No se encontró habitación' });
                }

                const habitacionSeleccionada = await Habitaciones.findOne({
                    where: { id: registroMasReciente.id_habitacionDestino },
                });

                if (!habitacionSeleccionada) {
                    return res.status(200).json({ msg: 'No se encontró habitación' });
                }

                const cuentas = await Cuenta.findAll({
                    where: { id_expediente: req.body.id, estado: 1 },
                    order: [['createdAt', 'DESC']],
                });

                if (cuentas.length === 0) {
                    return res.status(400).json({ msg: 'No se encontró ninguna cuenta activa' });
                }

                const cuentaSeleccionada = cuentas[0];

                const fechaHora1 = moment(registroMasReciente.createdAt);
                const fechaHora2 = moment();
                const horas = moment.duration(fechaHora2.diff(fechaHora1)).asHours();

                let subtotal = 0;
                if (horas <= 6) {
                    subtotal = parseFloat(habitacionSeleccionada.costo_ambulatorio);
                } else {
                    const dias = Math.ceil(horas / 24);
                    subtotal = parseFloat(habitacionSeleccionada.costo_diario) * dias;
                }

                await DetalleCuentas.create({
                    id_cuenta: cuentaSeleccionada.id,
                    tipo: "Pago por servicio de habitación",
                    id_externo: parseInt(registroMasReciente.id_habitacionDestino),
                    subtotal
                });

                await cuentaSeleccionada.update({ total: subtotal });
            }

            // 🔹 ACTUALIZAR CUENTA
            const cuentas = await Cuenta.findAll({
                where: { id_expediente: req.body.id, estado: 1 }
            });

            await DetalleHabitaciones.destroy({
                where: {
                    id_cuenta: cuentas[0].id,
                    tipo_habitacion: 'Emergencia'
                }
            });

            if (cuentas.length > 0) {
                await Cuenta.update({
                    pendiente_de_pago: cuentas[0].total - cuentas[0].total_pagado,
                    fecha_egreso: req.body.fecha || null,
                    hora_egreso: req.body.hora || null,
                }, {
                    where: { id: cuentas[0].id }
                });
            }

            const usuario = await Usuario.findOne({
                where: { user: req.body.user }
            });

            if (usuario && usuario.id_medico) {
                await DetalleHonorarios.create({
                    id_medico: usuario.id_medico,
                    id_cuenta: cuentas[0].id,
                    estado: 1,
                    lugar: 'Emergencia interno',
                    descripcion: 'pago a medico interno por emergencia',
                    total: 25.00,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    created_by: req.body.user
                });
            }

            // 🔹 ACTUALIZAR EXPEDIENTE
            await Expediente.update(
                { estado: req.body.estado }, // estado: 1 (Hospitalización)
                { where: { id: req.body.id } }
            );

            return res.status(200).json({ msg: 'Estado actualizado correctamente' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },

};