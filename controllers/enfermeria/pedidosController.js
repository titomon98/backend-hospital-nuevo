'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Pedido = db.pedidos;
const DetallePedido = db.detalle_pedidos;
const Medicamento = db.medicamentos;
const Comun = db.comunes;
const Quirurgico = db.quirurgicos;
const Usuarios = db.usuarios;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body
        const datos = {
            codigoPedido: req.body.codigoPedido,
            fecha: req.body.fecha,
            id_usuario: req.body.id_usuario,
            cantidadUnidades: req.body.cantidadUnidades,
            estado: 1
        };

        Pedido.create(datos)
        .then(pedido => {
            const pedido_id = pedido.id
            let cantidadUnidades = 0;
            let detalles = req.body.detalle
            let cantidad = req.body.detalle.length
            for (let i = 0; i < cantidad; i++){
                if (detalles[i].is_medicine === true){
                    let id_medicine = detalles[i].id_medicine
                    console.log(detalles[i])
                    console.log(pedido_id)
                    let datos_detalles = {
                        cantidad: parseInt(detalles[i].cantidad),
                        descripcion: detalles[i].nombre,
                        estado: 1,
                        id_paquete: parseInt(pedido_id),
                        id_medicamento: id_medicine
                    }
                    cantidadUnidades = cantidadUnidades + parseInt(detalles[i].cantidad)
                    DetallePedido.create(datos_detalles)
                    .then(detalle => {
                        Medicamento.update(
                        { 
                            existencia_actual: detalles[i].existencias_actuales
                        },
                        { where: { 
                            id: detalles[i].id_medicine
                        }})
                        .then(medicamento => res.status(200).send('El registro ha sido actualizado'))
                        .catch(error => {
                            console.log(error)
                            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
                        });
                    })
                    .catch(error => {
                        console.log(error)
                        return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
                    });
                }
                else if (detalles[i].is_quirurgico === true){
                    let id_quirurgico = detalles[i].id_quirurgico
                    let datos_detalles = {
                        cantidad: detalles[i].cantidad,
                        descripcion: detalles[i].descripcion,
                        estado: 1,
                        id_pedido: pedido_id,
                        id_quirurgico: id_quirurgico
                    }
                    cantidadUnidades = cantidadUnidades + parseInt(detalles[i].cantidad)
                    DetallePedido.create(datos_detalles).then(detalle => {
                        Quirurgico.update(
                        { 
                            existencia_actual: detalles[i].existencias_actuales
                        },
                        { where: { 
                            id: detalles[i].id_quirurgico
                        }})
                        .then(quirurgico => res.status(200).send('El registro ha sido actualizado'))
                        .catch(error => {
                            console.log(error)
                            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
                        });
                    })
                    .catch(error => {
                        console.log(error)
                        return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
                    });
                }
                else if (detalles[i].is_comun === true){
                    let id_comun = detalles[i].id_comun
                    let datos_detalles = {
                        cantidad: detalles[i].cantidad,
                        descripcion: detalles[i].descripcion,
                        estado: 1,
                        id_pedido: pedido_id,
                        id_comun: id_comun
                    }
                    DetallePedido.create(datos_detalles).then(detalle => {
                        Comun.update(
                        { 
                            existencia_actual: detalles[i].existencias_actuales
                        },
                        { where: { 
                            id: detalles[i].id_comun
                        }})
                        .then(comun => res.status(200).send('El registro ha sido actualizado'))
                        .catch(error => {
                            console.log(error)
                            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
                        });
                    })
                    .catch(error => {
                        console.log(error)
                        return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
                    });
                }
            }
            res.send(pedido);
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

        var condition = busqueda ? { [Op.or]: [{ codigoPedido: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Pedido.findAndCountAll({ 
            include: [
                {
                    model: DetallePedido,
                    require: true,
                },
                {
                    model: Usuarios,
                    require: true,
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

        return Pedido.findByPk(id)
        .then(pedido => res.status(200).send(pedido))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Pedido.update(
            {   
                fecha: form.fecha
            },
            { where: { 
                id: form.id 
            } }
        )
        .then(pedido => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    activate (req, res) {
        Pedido.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(pedido => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    deactivate (req, res) {
        Pedido.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(pedido =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    get (req, res) {
        Pedido.findAll({attributes: ['id', 'codigoPedido', 'fecha', 'id_usuario', 'estado']})
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    getPerYear (req, res) {
        const currentYear = new Date().getFullYear();
        const currentFirstDate = new Date(currentYear, 0, 1);
        const currentLastDate = new Date(currentYear, 11, 31);
        Pedido.findAll({attributes: ['id', 'codigoPedido', 'fecha', 'id_usuario', 'estado'],
            where: {
                fecha: {
                    [Op.between]: [currentFirstDate, currentLastDate] 
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
        var condition = busqueda?{ [Op.or]:[ {codigoPedido: { [Op.like]: `%${busqueda}%` }}],[Op.and]:[{estado:1}] } : {estado:1} ;
        Pedido.findAll({
            include: [
                {
                    model: DetallePedido,
                    require: true,
                },
                {
                    model: Usuarios,
                    require: true,
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

