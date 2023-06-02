'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Language = db.idiomas;
const Op = db.Sequelize.Op;

module.exports = {
    get (req, res) {
        Language.findAll({attributes: ['id', 'nombre']})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            console.log(err)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    }
}