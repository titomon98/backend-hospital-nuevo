'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Quirurgico = db.quirurgicos;
const Marca = db.marcas;
const Presentacion = db.presentaciones;
const Proveedor = db.proveedores;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form
        const datos = {
            nombre: form.name,
            precio_costo: form.precio_costo,
            precio_venta: form.precio_venta,
            existencia_minima_quirofano: form.existencia_minima_quirofano,
            existencia_actual_quirofano: form.existencia_actual_quirofano,
            existencia_minima_farmacia: form.existencia_minima_farmacia,
            existencia_actual_farmacia: form.existencia_actual_farmacia,
            existencia_minima: form.existencia_minima,
            existencia_actual: form.existencia_actual,
            inventariado: form.inventariado,
            id_presentacion: form.presentacion.id,
            id_proveedor: form.proveedor.id,
            id_marca: form.marca.id,
            estado: 1,
            factura: form.factura
        };

        Quirurgico.create(datos)
        .then(tipo => {
            res.send(tipo);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
                    
    },

    list(req, res) {
        const getPagingData = (data, page, limit) => {
            const { count: totalItems, rows: medicamentos } = data;
            const currentPage = page ? +page : 1;
            const totalPages = Math.ceil(totalItems / limit);
    
            return { totalItems, medicamentos, totalPages, currentPage };
        };
    
        const getPagination = (page, size) => {
            const limit = size ? +size : 10;
            const offset = page ? (page - 1) * limit : 0;
    
            return { limit, offset };
        };
    
        const busqueda = req.query.search;
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.limit) || 500;
    
        const { limit, offset } = getPagination(page, size);
    
        const condition = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null;
    
        Quirurgico.findAndCountAll({
            include: [
                { model: Marca },
                { model: Presentacion },
                { model: Proveedor },
            ],
            where: condition,
            limit,
            offset
        })
        .then(data => {
            const response = getPagingData(data, page, limit);
            res.send(response.medicamentos);
        })
        .catch(error => {
            console.error('Error en la consulta:', error);
            return res.status(500).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },    

    find (req, res) {
        const id = req.params.id;

        return Quirurgico.findByPk(id)
        .then(quirurgico => res.status(200).send(quirurgico))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Quirurgico.update(
            { 
                nombre: form.name,
                precio_costo: form.precio_costo,
                precio_venta: form.precio_venta,
                existencia_minima_quirofano: form.existencia_minima_quirofano,
                existencia_actual_quirofano: form.existencia_actual_quirofano,
                existencia_minima_farmacia: form.existencia_minima_farmacia,
                existencia_actual_farmacia: form.existencia_actual_farmacia,
                existencia_minima: form.existencia_minima,
                existencia_actual: form.existencia_actual,
                inventariado: form.inventariado,
                id_presentacion: form.presentacion.id,
                id_proveedor: form.proveedor.id,
                id_marca: form.marca.id,
            },
            { where: { 
                id: form.id 
            } }
        )
        .then(quirurgico => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    activate (req, res) {
        Quirurgico.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(quirurgico => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    deactivate (req, res) {
        Quirurgico.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(quirurgico =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    get (req, res) {
        Quirurgico.findAll({attributes: ['id', 'nombre', 'existencia_actual', 'precio_venta'], 
            where: {
                existencia_actual:{
                    [Op.gt]:0
                }
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
    getSearch (req, res) {
        var busqueda = req.query.search;
        var condition = busqueda ? {
            [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` }}],
            [Op.and]: [{inventariado: 'INVENTARIADO'},{ estado: 1 }, { factura: 1 }]
        } : [{inventariado: 'INVENTARIADO'}, { estado: 1 }, { factura: 1 }];
        Quirurgico.findAll({
            include: [
                {
                    model: Marca,
                },
                {
                    model: Presentacion
                },
                {
                    model: Proveedor
                },
            ],
            where: condition})
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    getSearchNo (req, res) {
        var busqueda = req.query.search;
        var condition = busqueda ? {
            [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` }}],
            [Op.and]: [{ estado: 1 }, { factura: 0 }]
        } : [{ estado: 1 }, { factura: 0 }];
        Quirurgico.findAll({
            include: [
                {
                    model: Marca,
                },
                {
                    model: Presentacion
                },
                {
                    model: Proveedor
                },
            ],
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

