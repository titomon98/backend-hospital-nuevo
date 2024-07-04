'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Consumo = db.consumos;
const Servicio = db.servicios;
const Cuenta = db.cuentas;
const Op = db.Sequelize.Op;

module.exports = {
    async create(req, res) {
        let form = req.body.form

        const cuentas = await Cuenta.findAll({
            where: {
                id_expediente: form.id
            },
            order: [['createdAt', 'DESC']]
        })
        let cuentaSeleccionada = null;
        for (const cuenta of cuentas) {
          if (cuenta.dataValues.estado == 1) {
            cuentaSeleccionada = cuenta;
            break;
          }
        }

        if (!cuentaSeleccionada) {
            return res.status(400).json({ msg: 'No se encontró ninguna cuenta activa para este expediente' });
          }
        const id_cuenta = cuentaSeleccionada.dataValues.id

        let totalCuenta = cuentaSeleccionada.dataValues.total || 0; 

        let subtotal = (parseFloat(form.cantidad) * parseFloat(form.servicio.precio))

        let nuevoTotal = (parseFloat(totalCuenta) + parseFloat(subtotal))
        console.log(nuevoTotal)
        
        let pendientePago = (parseFloat(nuevoTotal) - parseFloat(cuentaSeleccionada.dataValues.total_pagado))

        const datos = {
            cantidad: form.cantidad,
            descripcion: form.descripcion,
            subtotal: subtotal,
            estado: 1,
            id_servicio: form.servicio.id,
            id_cuenta: id_cuenta
        };

        await cuentaSeleccionada.update({ total: nuevoTotal, pendiente_de_pago: pendientePago });
        await Consumo.create(datos)
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

        var condition = busqueda ? { [Op.or]: [{ contenido: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Consumo.findAndCountAll({ where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
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

        return Consumo.findByPk(id)
        .then(marca => res.status(200).send(marca))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Consumo.update(
            { 
                cantidad: form.cantidad,
                descripcion: form.descripcion,
                subtotal: form.servicio.precio,
                estado: 1,
                id_servicio: form.servicio.id,
                id_cuenta: form.id_cuenta
            },
            { where: { 
                id: form.id 
            } }
        )
        .then(marca => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    activate (req, res) {
        Consumo.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(marca => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    deactivate (req, res) {
        Consumo.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(marca =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    
    get(req, res) {
        Consumo.findAll({
            where: {
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

    getSearch (req, res) {
        var busqueda = req.query.search;
        var condition = busqueda?{ [Op.or]:[ {contenido: { [Op.like]: `%${busqueda}%` }}],[Op.and]:[{estado:1}] } : {estado:1} ;
        Consumo.findAll({
            where: condition})
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    async getId (req, res) {
        const id = req.query.id;
        const cuentas = await Cuenta.findAll({
            where: {
                id_expediente: id
            },
            order: [['createdAt', 'DESC']]
        })
        let cuentaSeleccionada = null;
        for (const cuenta of cuentas) {
          if (cuenta.dataValues.estado == 1) {
            cuentaSeleccionada = cuenta;
            break;
          }
        }

        if (!cuentaSeleccionada) {
            return res.status(400).json({ msg: 'No se encontró ninguna cuenta activa para este expediente' });
          }
        const id_cuenta = cuentaSeleccionada.dataValues.id
        console.log(id)
        console.log(id_cuenta)

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

        const page=req.query.page-1;
        const size=req.query.limit;
        const criterio=req.query.criterio;
        const order=req.query.order;
        
        const { limit, offset } = getPagination(page, size);

        Consumo.findAndCountAll({ include: [
            {
                model: Servicio,
                require: true
            },
            {
                model: Cuenta,
                require: true
            }
        ], where: { 
            id_cuenta: id_cuenta,
        }, order:[[`${criterio}`,`${order}`]],limit,offset})
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
};

