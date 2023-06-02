'use strict'
const Sequelize     = require('sequelize');
const db = require("../../../models");
const Receta = db.pagos;
const Paciente = db.pacientes;
const Especialidad = db.especialidades;
const Usuario = db.usuarios;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form
        const datos = {         
            fecha_pago: form.fecha_pago,
            tipo_pago: form.tipo_pago.nombre,
            referencia: form.referencia,
            saldo_actual: form.saldo_actual,
            cantidad_pagada: form.cantidad_pagada,
            balance_restante: form.balance_restante,
            notas: form.notas,
            estado: 1,
            id_paciente: form.id_paciente,
            id_usuario: form.id_usuario,
        };
        
        Receta.create(datos)
        .then(receta => {
        res.send(receta);

        }).catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
                    
    },

    update (req, res) {
        let form = req.body.form
        Receta.update(
            {
                fecha_pago: form.fecha_pago,
                tipo_pago: form.tipo_pago.nombre,
                referencia: form.referencia,
                saldo_actual: form.saldo_actual,
                cantidad_pagada: form.cantidad_pagada,
                balance_restante: form.balance_restante,
                notas: form.notas,
                estado: 1,
                id_paciente: form.id_paciente,
                id_usuario: form.id_usuario,
            },
            { where: { 
                id: form.id 
            } }
        )
        .then(receta => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => res.status(400).send(error))
    },

    activate (req, res) {
        let id = req.body.id
        Receta.update(
            { estado: 1 },
            { where: { 
                id: id
            } }
        )
        .then(receta => res.status(200).send('El registro ha sido activado'))
        .catch(error => res.status(400).send(error))
    },

    deactivate (req, res) {
        let id = req.body.id
        Receta.update(
            { estado: 0 },
            { where: { 
                id: id
            } }
        )
        .then(receta =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => res.status(400).send(error))
    },

    get (req, res) {
        const { id } = req.query;
        // Validación de backend
        if (!(id)) {
            return res.status(400).send("No llenó todos los campos");
        }
        Receta.findAll({ 
            where: { 
                id_paciente: id 
            },
            include: [
                {
                    model: Paciente,
                    as: 'paciente',
                    require: true,
                },
                {
                    model: Usuario,
                    as: 'usuario',
                    require: true,
                }
            ]
        })
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
};

