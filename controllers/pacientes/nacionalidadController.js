'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Nationality = db.nacionalidades;
const Op = db.Sequelize.Op;

module.exports = {
    get (req, res) {
        Nationality.findAll({attributes: ['id', 'nombre']})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            console.log(err)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    create (req, res) {
        let form = req.body.form
        console.log(form)

        const datos = {
            nombre: form.name,
            estado: 1
        };

        Nationality.create(datos)
        .then(nacionalidad => {
            res.send(nacionalidad);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    }
}