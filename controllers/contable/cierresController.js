'use strict'
'use strict'
const Sequelize     = require('sequelize');
const moment = require('moment');
const db = require("../../models");
const Ventas = db.ventas;
const DetalleVentas = db.detalle_ventas;
const Medicina = db.medicamentos;
const Op = db.Sequelize.Op;

module.exports = {
    getDiario (req, res) {
        const TODAY_START = moment().format('YYYY-MM-DD 00:00');
        const NOW = moment().subtract(0, 'h').format();
        Ventas.findAll({attributes: ['id', 'total', 'nit', 'client'], where: { //se debe enviar la condicion con el operador antes de los objetos
            createdAt: {
                [Op.between]: [
                    TODAY_START,
                    NOW,
                ]
            },
        }})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
            message:
            err.message || "Ha ocurrido un error."
            });
        });
    },
    getEspecifico (req, res) {
        console.log(req.body)
        const TODAY_START = req.body.inicio;
        const NOW = req.body.fin;
        Ventas.findAll({attributes: ['id', 'total', 'nit', 'client'], where: { //se debe enviar la condicion con el operador antes de los objetos
            createdAt: {
                [Op.between]: [
                    TODAY_START,
                    NOW,
                ]
            },
        }})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
            message:
            err.message || "Ha ocurrido un error."
            });
        });
    }
}