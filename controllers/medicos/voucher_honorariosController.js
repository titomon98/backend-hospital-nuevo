'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Medico = db.medicos;
const VoucherHonorarios = db.voucher_honorarios;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body
        const restarHoras = (fecha, horas) => {
            let nuevaFecha = new Date(fecha);
            nuevaFecha.setHours(nuevaFecha.getHours() - horas);
            return nuevaFecha;
        };
        const datos = {
            nombre_medico: form.medico.nombre,
            nit: form.medico.nit,
            cantidad_pagada: form.cantidad,
            fecha_creacion: restarHoras(new Date(), 6),
            createdAt: restarHoras(new Date(), 6),
            updatedAt: restarHoras(new Date(), 6),
            created_by: req.body.user
        };

        VoucherHonorarios.create(datos)
        .then(tipo => {
            res.send(tipo);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    async getSearch (req, res) {
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
            const fechaActual = restarHoras(new Date(), 6)
            const [Medicos, ultimo_id] = await Promise.all([
                Medico.findAll({ where: condition }),
                VoucherHonorarios.findOne({
                    attributes: ['id'],
                    order: [['id', 'DESC']],
                }),
            ]);
            const numero = ultimo_id? ultimo_id.id + 1 : 1;
            res.json({ Medicos, numero, fechaActual });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al generar el reporte de pacientes fallecidos' });
        }
    }
};

