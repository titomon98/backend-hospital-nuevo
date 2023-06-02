'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Compras = db.compras;
const DetalleCompras = db.detalle_compras;
const Medicina = db.medicamentos;
const Proveedor = db.proveedores;
const Destino = db.destinos;
const Contribuyente = db.contribuyentes;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let body = req.body
        let now = new Date();
        let datos = {
            nit: body.proveedor.nit,
            direccion: body.direccion,
            estado: 1,
            total: 0.0,
            factura: '',
            id_usuario: body.id_usuario,
            id_proveedor: body.proveedor.id,
            id_contribuyente: body.contribuyente.id,
            id_destino: body.destino.id,
            fecha: now
        };

        Compras.create(datos)
        .then(compras => {
            const compra = compras.id;
            let total = 0;
            let cantidad = body.detalle.length
            let detalles = body.detalle
            console.log(body.detalle)
            for (let i = 0; i < cantidad; i++) {
                let id_inventario = body.detalle[i].id_medicine
                let datos_detalles = {
                    cantidad: detalles[i].cantidad,
                    descripcion: detalles[i].descripcion,
                    subtotal: detalles[i].total,
                    estado: 1,
                    id_compra: compra,
                    id_inventario: id_inventario,
                }
                total = total + parseFloat(detalles[i].total)
                DetalleCompras.create(datos_detalles)
                .then(detalles => {
                    //Aqui subir existencias
                    let existencias_actuales = parseInt(datos_detalles.existencia_actual) + parseInt(datos_detalles.cantidad)
                    Medicina.update(
                        { 
                            existencia_total: existencias_actuales
                        },
                        { where: { 
                            id: id_inventario
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
            Compras.update({
                total: total
            },
            { 
                where: { 
                id: compra
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

        var condition = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Compras.findAndCountAll({ 
            include: [
                {
                    model: Proveedor,
                    require: true
                },
                {
                    model: Destino,
                    require: true
                },
                {
                    model: Contribuyente,
                    require: true
                }
            ],
            where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        console.log('data: '+JSON.stringify(data))
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems,last_page:response.totalPages,from:response.currentPage,to:response.totalPages,data:response.referido});
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

        return Compras.findByPk(id)
        .then(compra => res.status(200).send(compra))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Compras.update(
            { nombre: form.name },
            { where: { 
                id: form.id 
            } }
        )
        .then(compra => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => res.status(400).send(error))
    },

    activate (req, res) {
        Compras.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(compra => res.status(200).send('El registro ha sido activado'))
        .catch(error => res.status(400).send(error))
    },

    deactivate (req, res) {
        Compras.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(compra =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => res.status(400).send(error))
    },
    get (req, res) {
        Marca.findAll({
            include: [
                {
                    model: Proveedor,
                    require: true
                },
                {
                    model: Destino,
                    require: true
                },
                {
                    model: Contribuyente,
                    require: true
                }
            ]
        })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
            message:
            err.message || "Ha ocurrido un error."
            });
        });
    },
    getToday (req, res) {
        //Tomar fecha de hoy
        const TODAY_START = new Date();
        const TOMORROW = new Date();
        TODAY_START.setHours(0,0,0,0);
        TOMORROW.setDate(TODAY_START.getDate() + 1);
        TOMORROW.setHours(0,0,0,0);
        Compras.findAll({ 
            include: [
                {
                    model: DetalleCompras,
                    as: 'detalle_compras',
                    require: true,
                },
                {
                    model: Proveedor,
                    require: true
                },
                {
                    model: Destino,
                    require: true
                },
                {
                    model: Contribuyente,
                    require: true
                }
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
        const fechas = req.query
        //Tomar fecha de hoy
        const TODAY_START = fechas.start;
        const TOMORROW = fechas.end;
        Compras.findAll({ 
            include: [
                {
                    model: DetalleCompras,
                    as: 'detalle_compras',
                    require: true,
                },
            ],
            where: {
                fecha: { [Sequelize.Op.between]: [TODAY_START, TOMORROW] } // use the "between" operator
            }
        })
        .then(data => {
            console.log(data)
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
};

