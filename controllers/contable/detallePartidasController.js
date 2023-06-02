'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Partidas = db.partidas;
const DetallePartidas = db.detalle_partidas;
const Nomenclatura = db.nomenclaturas;
const Op = db.Sequelize.Op;

module.exports = {
    getEspecifico (req, res) {
        const fechas = req.body
        //Tomar fecha de hoy
        const TODAY_START = fechas.start;
        const TOMORROW = fechas.end;
        
        DetallePartidas.findAll({ 
            include: [
                {
                    model: Partidas,
                    as: 'partida',
                    require: true,
                },
                {
                    model: Nomenclatura,
                    require: true,
                },
            ],
            where: {
                createdAt: { [Sequelize.Op.between]: [TODAY_START, TOMORROW] } // use the "between" operator
            }
        })
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    getMayor (req, res) {
        const fechas = req.query
        //Tomar fecha de hoy
        const TODAY_START = fechas.start;
        const TOMORROW = fechas.end;
        
        DetallePartidas.findAll({ 
            include: [
                {
                    model: Nomenclatura,
                    require: true,
                    attributes: ['id', 'nombre']
                },
            ],
            attributes: ['id', 'posicion', 'cantidad'],
            where: {
                createdAt: { [Sequelize.Op.between]: [TODAY_START, TOMORROW] }, // use the "between" operator
                estado: 1
            }
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

