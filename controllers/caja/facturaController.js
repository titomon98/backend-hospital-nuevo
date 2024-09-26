'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Facturas = db.facturas;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body
        let nuevaFecha = new Date(); // Crear una nueva instancia de fecha
        nuevaFecha.setHours(nuevaFecha.getHours() - 6);
        const datos = {
            nit: form.nit, 
            id_cuenta_hospital: form.id_cuenta_hospital,
            id_cuenta_laboratorio: form.id_cuenta_laboratoio,
            total: form.total,
            imagen: form.imagen[0],
            estado: 1,
            fecha: nuevaFecha,
            id_usuario: form.id_usuario,
            numero: form.numero, 
            serie: form.serie,
            referencia_factura: form.referencia_factura
        };
        Facturas.create(datos)
        .then(tipo => {
            res.send(tipo);
        })
        .catch(error => {
            console.log("------------------------------------------------------ERROR------------------")
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
                    
    },
    update(req, res) {
        let form = req.body
        const datos = {
            nit: form.nit, 
            imagen: form.imagen[0],
            numero: form.numero, 
            serie: form.serie,
            referencia_factura: form.referencia_factura
        };
        Facturas.update(datos,
            { where: { 
                id_cuenta_hospital: form.id_cuenta_hospital,
                id_cuenta_laboratorio: form.id_cuenta_laboratoio
            } }
        )
        .then(tipo => {
            res.send(tipo);
        })
        .catch(error => {
            console.log("------------------------------------------------------ERROR------------------")
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
                    
    },

    getList (req, res) {
        console.log(req.body)
        Facturas.findAll()
        .then(data => {
            console.log()
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    
    getSearch (req, res) {
        var busqueda = req.query.search;
        var condition = busqueda?{ [Op.or]:[ {contrato: { [Op.like]: `%${busqueda}%` }}],[Op.and]:[{estado:1}] } : {estado:1} ;
        Contrato.findAll({
            where: condition})
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    }
};

