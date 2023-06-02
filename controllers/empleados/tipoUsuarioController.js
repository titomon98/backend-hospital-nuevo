'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Usuario = db.usuarios;
const Tipo = db.tipo_usuarios;
const Op = db.Sequelize.Op;

module.exports = {
    // get tipos
    get (req, res) {
        return Tipo.findAll({})
        .then(tipo => res.status(200).send(tipo))
        .catch(error => res.status(400).send(error))
    },
};