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
        const datos = {
            codigoPedido: req.body.codigoPedido,
            fecha: req.body.fecha,
            id_usuario: req.body.id_usuario,
            cantidadUnidades: req.body.cantidadUnidades,
            estado: 1
        };

        // destino de las lineas: 1 = enfermeria (existencia_actual_farmacia),
        // 2 = quirofano (existencia_actual_quirofano). Se deriva del radio "picked"
        // que manda enfermeria (0 = farmacia, 1 = quirofano).
        const destino = parseInt(req.body.picked) === 1 ? 2 : 1;

        // IMPORTANTE: el create YA NO mueve existencias. El traslado (restar de
        // existencia_actual y sumar al area destino) ahora ocurre al surtir cada
        // linea en detallePedidosController.surtir. Aqui solo se crean cabecera y
        // lineas. Ver SURTIR_DETALLE.md.
        Pedido.create(datos)
        .then(pedido => {
            const pedido_id = pedido.id
            const detalles = req.body.detalle || []

            const filas = detalles.map(item => {
                const datos_detalles = {
                    cantidad: parseInt(item.cantidad),
                    descripcion: item.nombre,
                    estado: 1,
                    destino: destino,
                    id_pedido: pedido_id
                }
                if (item.is_medicine === true) {
                    datos_detalles.id_medicamento = item.id_medicine
                } else if (item.is_quirurgico === true) {
                    datos_detalles.id_quirurgico = item.id_quirurgico
                } else if (item.is_comun === true) {
                    datos_detalles.id_comun = item.id_comun
                }
                return datos_detalles
            })

            return Promise.all(filas.map(f => DetallePedido.create(f)))
                .then(() => res.send(pedido))
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

        var condition = busqueda ? {
             [Op.or]: [{ codigoPedido: { [Op.like]: `%${busqueda}%` } }], estado: 1
            } : {estado: 1} ;

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
            where: condition
            ,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        const response = getPagingData(data, page, limit);

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

