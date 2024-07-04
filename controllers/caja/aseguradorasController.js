'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Aseguradora = db.aseguradoras;

module.exports = {
    
    create(req, res) {
        let form = req.body

        const datos = {
            telefono: form.telefono,
            nombre: req.nombre
        };

        Aseguradora.create(datos)
        .then(tipo => {
            tipo => {
                res.send(tipo);
        }})   
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
                    
    },

    get (req, res) {
        
        return Aseguradora.findAll({
        })
        .then(tipo => res.status(200).send(tipo))
        .catch(error => res.status(400).send(error))
    },

};
