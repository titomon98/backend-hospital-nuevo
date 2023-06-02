'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Ventas = db.ventas;
const DetalleVentas = db.detalle_ventas;
const Usuarios = db.usuarios;
const Medicina = db.medicamentos;
const Op = db.Sequelize.Op;
const moment = require('moment');

module.exports = {
    create(req, res) {
        let body = req.body
        let now = new Date();
        let datos = {
            nit: body.nit,
            client: body.cliente,
            direccion: body.direccion,
            estado: 2,
            estado_cobro: 2,
            total: 0.0,
            factura: '',
            id_usuario: body.id_usuario,
            fecha: now,
            serie: body.serie,
            tipo_cobro: body.tipo_cobro.nombre
        };

        Ventas.create(datos)
        .then(ventas => {
            const venta = ventas.id;
            let total = 0;
            let cantidad = body.detalle.length
            let detalles = body.detalle
            for (let i = 0; i < cantidad; i++) {
                if (detalles[i].is_medicine === 1){
                    let id_medicine = detalles[i].id_medicine
                    let datos_detalles = {
                        cantidad: detalles[i].cantidad,
                        descripcion: detalles[i].descripcion,
                        subtotal: detalles[i].total,
                        estado: 1,
                        id_venta: venta,
                        id_inventario: detalles[i].id_medicine,
                        existencia_actual: detalles[i].existencia_actual
                    }
                    total = total + parseFloat(detalles[i].total)
                    DetalleVentas.create(datos_detalles)
                    .then(detalles => {
                        //Aqui descontar existencias
                        let existencias_actuales = parseInt(datos_detalles.existencia_actual) - parseInt(datos_detalles.cantidad)
                        Medicina.update(
                            { 
                                existencia_total: existencias_actuales
                            },
                            { where: { 
                                id: id_medicine
                            }}
                        )
                        .then(console.log('Actualizado'))
                        .catch(error => {
                            console.log(error)
                            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
                        });

                    }).catch(err => {
                        console.log(err)
                        res.status(500).send({
                        message:
                        err.message || "Ocurrió un error"
                    });
                    }); 
                }
                else {
                    let datos_detalles = {
                        cantidad: detalles[i].cantidad,
                        descripcion: detalles[i].descripcion,
                        subtotal: detalles[i].total,
                        estado: 1,
                        id_venta: venta,
                    }
                    total = total + parseFloat(detalles[i].total)
                    DetalleVentas.create(datos_detalles)
                    .then(detalles => {
                        
                    }).catch(err => {
                        console.log(err)
                        res.status(500).send({
                        message:
                        err.message || "Ocurrió un error"
                    });
                    }); 
                }
                
                
            }
            Ventas.update({
                total: total
            },
            { 
                where: { 
                id: venta
            }});
            res.send('Todo bien')
        })
        .catch(err => {
            console.log(err)
            res.status(500).send({
            message:
            err.message || "Ocurrió un error"
        });
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

        var condition = busqueda ? { [Op.or]: [{ client: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Ventas.findAndCountAll({ 
            include: [
                {
                    model: DetalleVentas,
                    require: true,
                },
                {
                    model: Usuarios,
                    require: true,
                },
            ],
            where: condition, order:[[`${criterio}`,`${order}`]], limit, offset})
        .then(data => {

        console.log('data: '+JSON.stringify(data))
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems, current_page: page+1,last_page:response.totalPages,from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(err => {
            res.status(500).send({
            message:
            err.message || "Ha ocurrido un error."
            });
        });
    },

    listAccounting (req, res) {
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

        var condition = busqueda ? { [Op.or]: [{ client: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Ventas.findAndCountAll({ 
            include: [
                {
                    model: DetalleVentas,
                    require: true,
                },
                {
                    model: Usuarios,
                    require: true,
                },
            ],
            where: {
                estado: 2
            }, order:[[`${criterio}`,`${order}`]], limit, offset})
        .then(data => {

        console.log('data: '+ JSON.stringify(data))
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems, current_page: page+1,last_page:response.totalPages,from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(err => {
            res.status(500).send({
            message:
            err.message || "Ha ocurrido un error."
            });
        });
    },

    find (req, res) {
        const id = req.params.id;

        return Ventas.findByPk(id)
        .then(ventas => res.status(200).send(ventas))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Ventas.update(
            { nombre: form.name },
            { where: { 
                id: form.id 
            } }
        )
        .then(ventas => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => res.status(400).send(error))
    },

    activate (req, res) {
        Ventas.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(ventas => res.status(200).send('El registro ha sido activado'))
        .catch(error => res.status(400).send(error))
    },

    deactivate (req, res) {
        DetalleVentas.findAll({where: { id_venta: req.body.id }}).then(data => {

            console.log(data)
            //Pendiente de volver a cargar datos a inventario
        })
        .catch(err => {
            res.status(500).send({
            message:
            err.message || "Ha ocurrido un error."
            });
        });
        Ventas.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            }}
        )
        .then(ventas =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => res.status(400).send(error))
    },

    get (req, res) {
        Ventas.findAll({ 
            include: [
                {
                    model: DetalleVentas,
                    as: 'detalle_ventas',
                    require: true,
                },
            ]
        })
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    getToday (req, res) {
        //Tomar fecha de hoy
        const TODAY_START = new Date();
        const TOMORROW = new Date();
        TODAY_START.setHours(0,0,0,0);
        TOMORROW.setDate(TODAY_START.getDate() + 1);
        TOMORROW.setHours(0,0,0,0);
        Ventas.findAll({ 
            include: [
                {
                    model: DetalleVentas,
                    as: 'detalle_ventas',
                    require: true,
                },
            ],
            where: {
                fecha: { [Sequelize.Op.between]: [TODAY_START, TOMORROW] } // use the "between" operator
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

    getEspecifico (req, res) {
        console.log(req.query)
        const fechas = req.query
        //Tomar fecha de hoy
        const TODAY_START = fechas.start;
        const TOMORROW = fechas.end;
        Ventas.findAll({ 
            include: [
                {
                    model: DetalleVentas,
                    as: 'detalle_ventas',
                    require: true,
                },
            ],
            where: {
                fecha: { [Sequelize.Op.between]: [TODAY_START, TOMORROW] } // use the "between" operator
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

