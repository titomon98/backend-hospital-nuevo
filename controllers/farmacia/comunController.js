'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Comun = db.comunes;
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
            estado: 1
        };

        Comun.create(datos)
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
            const { count: totalItems, rows: referido } = data;

            const currentPage = page ? +page : 0;
            const totalPages = Math.ceil(totalItems / limit);

            return { totalItems, referido, totalPages, currentPage };
        };


        const getPagination = (page, size) => {
            const limit = size ? +size : 2;
            const offset = page ? page * limit : 0;

            return { limit, offset };
        };

        const busqueda=req.query.search;
        const page=req.query.page-1;
        const size=req.query.limit;
        const criterio=req.query.criterio;
        const order=req.query.order;


        const { limit, offset } = getPagination(page, size);

        var condition = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Comun.findAndCountAll({ 
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
            where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        console.log('data: '+JSON.stringify(data))
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems,last_page:response.totalPages, current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },


    find (req, res) {
        const id = req.params.id;

        return Comun.findByPk(id)
        .then(comun => res.status(200).send(comun))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Comun.update(
            { 
                nombre: form.name,
                precio_costo: form.precio_costo,
                precio_venta: form.precio_venta,
                existencia_minima: form.existencia_minima,
                existencia_actual: form.existencia_actual,
                existencia_minima_quirofano: form.existencia_minima_quirofano,
                existencia_actual_quirofano: form.existencia_actual_quirofano,
                existencia_minima_farmacia: form.existencia_minima_farmacia,
                existencia_actual_farmacia: form.existencia_actual_farmacia,
                inventariado: form.inventariado,
                id_presentacion: form.presentacion.id,
                id_proveedor: form.proveedor.id,
                id_marca: form.marca.id,
            },
            { where: { 
                id: form.id 
            } }
        )
        .then(comun => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    activate (req, res) {
        Comun.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(comun => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    deactivate (req, res) {
        Comun.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(comun =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    get (req, res) {
        console.log('helou--------------------------')
        Comun.findAll({attributes: ['id', 'nombre', 'existencia_actual'], 
            where: {
                existencia_actual:{
                    [Op.gt]:0
                }
            }})
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' + error });
        });
    },
    getSearch (req, res) {
        var busqueda = req.query.search;
        var condition = busqueda ? {
            [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` }}],
            [Op.and]: [{ estado: 1 }, { factura: 1 }]
        } : [{ estado: 1 }, { factura: 1 }];
        Comun.findAll({
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
        Comun.findAll({
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

