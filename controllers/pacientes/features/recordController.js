'use strict'
const Sequelize     = require('sequelize');
const db = require("../../../models");
const Records = db.records;
const Logs = db.record_logs;
const Paciente = db.pacientes;
const Usuario = db.usuarios;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form
        const datos = {         
            contenido: form.contenido,
            estado: 1,
            id_paciente: form.id_paciente,
            id_usuario: form.id_usuario,
        };
        
        Records.create(datos)
        .then(receta => {
        res.send(receta);

        }).catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
                    
    },

    update (req, res) {
        let form = req.body
        const datosLogs = {
            contenido: form.contenido,
            id_record: form.id,
            estado: 1
        }
        Records.update(
            {
                contenido: form.contenido,
            },
            { where: { 
                id: form.id 
            }}
        )
        .then(
            Logs.create(datosLogs).then(res.send("Actualizacion y log correctos")).catch(error => res.status(400).send(error))
        )
        .catch(error => res.status(400).send(error))
    },

    activate (req, res) {
        let id = req.body.id
        Records.update(
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
        Records.update(
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
        Records.findAll({ 
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

