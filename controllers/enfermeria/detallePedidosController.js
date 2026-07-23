'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Pedido = db.pedidos;
const DetallePedido = db.detalle_pedidos;
const Medicamento = db.medicamentos;
const Quirurgico = db.quirurgicos;
const Comunes = db.comunes;
const Usuarios = db.usuarios;
const Op = db.Sequelize.Op;

module.exports = {
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

        const busqueda=req.query.id_pedido;
        const page=req.query.page-1;
        const size=req.query.limit;
        const criterio=req.query.criterio;
        const order=req.query.order;


        const { limit, offset } = getPagination(page, size);

        var condition = busqueda ? {
            id_pedido: req.body.id_pedido
            } : req.body.id_pedido ;

        DetallePedido.findAndCountAll({ 
            include: [
                {
                    model: Pedido,
                    require: true,
                },
            ],
            where: condition
            ,order:[[`${criterio}`,`${order}`]],limit,offset})
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

    // Lista PLANA de lineas pendientes de surtir (estado 1) de todos los pedidos,
    // paginada como la espera vuetable. Incluye el pedido (para el codigo) y el
    // producto asociado. Usada por PedidosPendientesParent (farmacia).
    getPendientes (req, res) {
        const getPagingData = (data, page, limit) => {
            const { count: totalItems, rows: referido } = data;
            const currentPage = page ? +page : 0;
            const totalPages = Math.ceil(totalItems / limit);
            return { totalItems, referido, totalPages, currentPage };
        };

        const getPagination = (page, size) => {
            const limit = size ? +size : 5;
            const offset = page ? page * limit : 0;
            return { limit, offset };
        };

        const busqueda = req.query.search;
        const page = req.query.page - 1;
        const size = req.query.limit;
        const criterio = req.query.criterio || 'id';
        const order = req.query.order || 'desc';

        const { limit, offset } = getPagination(page, size);

        const condition = busqueda
            ? { estado: 1, descripcion: { [Op.like]: `%${busqueda}%` } }
            : { estado: 1 };

        DetallePedido.findAndCountAll({
            include: [
                { model: Pedido, required: true },
                { model: Medicamento, required: false },
                { model: Comunes, required: false },
                { model: Quirurgico, required: false }
            ],
            where: condition,
            order: [[`${criterio}`, `${order}`]],
            limit,
            offset,
            distinct: true
        })
        .then(data => {
            const response = getPagingData(data, page, limit);
            res.send({ total: response.totalItems, last_page: response.totalPages, current_page: page + 1, from: response.currentPage, to: response.totalPages, data: response.referido });
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    getByAccountId (req, res) {
        return DetallePedido.findAll({
            where: {
                id_pedido: req.query.id,
            },
            include: [
                {
                    model: Medicamento,
                    require: false
                },
                {
                    model: Comunes,
                    require: false
                },
                {
                    model: Quirurgico,
                    require: false
                }
            ],
        })
            .then(tipo => {
                console.log(tipo)
                res.status(200).send(tipo)}
            )
            .catch(error => {
                console.log(error)
                res.status(400).send(error)
            })
    },

    // Surtir una linea individual del pedido (traslado de existencias).
    // detalle_pedidos.estado: 1 = pendiente, 0 = surtido.
    // Todo (lectura + validacion + updates) va dentro de una transaccion con
    // lock de fila para que un doble click nunca mueva existencias dos veces.
    surtir(req, res) {
        const id = req.body.id;
        if (!id) {
            return res.status(400).json({ msg: 'Falta el id del detalle a surtir' });
        }

        return db.sequelize.transaction(async (t) => {
            const detalle = await DetallePedido.findByPk(id, {
                lock: t.LOCK.UPDATE,
                transaction: t
            });

            if (!detalle) {
                const err = new Error('No se encontró el detalle del pedido');
                err.status = 404;
                throw err;
            }

            // IDEMPOTENCIA: si la linea ya esta surtida (estado 0), no se vuelve a
            // mover existencias. Se responde sin tocar nada.
            if (detalle.estado === 0) {
                return { yaSurtido: true, detalle };
            }

            const cantidad = parseInt(detalle.cantidad);

            // Resolver el producto correcto segun el tipo de linea.
            let Modelo = null;
            let productoId = null;
            if (detalle.id_medicamento) { Modelo = Medicamento; productoId = detalle.id_medicamento; }
            else if (detalle.id_comun) { Modelo = Comunes; productoId = detalle.id_comun; }
            else if (detalle.id_quirurgico) { Modelo = Quirurgico; productoId = detalle.id_quirurgico; }

            if (!Modelo) {
                const err = new Error('La línea no tiene producto asociado');
                err.status = 400;
                throw err;
            }

            const producto = await Modelo.findByPk(productoId, {
                lock: t.LOCK.UPDATE,
                transaction: t
            });

            if (!producto) {
                const err = new Error('No se encontró el producto de la línea');
                err.status = 404;
                throw err;
            }

            const existenciaActual = parseInt(producto.existencia_actual) || 0;

            // VALIDACION: nunca dejar existencias en negativo.
            if (existenciaActual < cantidad) {
                const err = new Error('Existencia insuficiente para surtir la línea');
                err.status = 400;
                throw err;
            }

            // TRASLADO: resta del total general y suma al area destino.
            // destino 1 -> existencia_actual_farmacia (enfermeria)
            // destino 2 -> existencia_actual_quirofano
            const campoDestino = detalle.destino === 2
                ? 'existencia_actual_quirofano'
                : 'existencia_actual_farmacia';
            const existenciaDestino = parseInt(producto[campoDestino]) || 0;

            await producto.update({
                existencia_actual: existenciaActual - cantidad,
                [campoDestino]: existenciaDestino + cantidad
            }, { transaction: t });

            // Marca la linea como surtida.
            await detalle.update({ estado: 0 }, { transaction: t });

            // Si TODAS las lineas del pedido quedaron surtidas, cierra la cabecera
            // para que salga de los listados de pendientes (que filtran estado: 1).
            const pendientes = await DetallePedido.count({
                where: { id_pedido: detalle.id_pedido, estado: 1 },
                transaction: t
            });
            const pedidoCerrado = pendientes === 0;
            if (pedidoCerrado) {
                await Pedido.update(
                    { estado: 0 },
                    { where: { id: detalle.id_pedido }, transaction: t }
                );
            }

            return { yaSurtido: false, detalle, pedidoCerrado };
        })
        .then(result => {
            if (result.yaSurtido) {
                return res.status(200).json({
                    msg: 'La línea ya estaba surtida',
                    id: result.detalle.id,
                    estado: 0,
                    yaSurtido: true
                });
            }
            return res.status(200).json({
                msg: 'Línea surtida correctamente',
                id: result.detalle.id,
                estado: 0,
                yaSurtido: false,
                pedidoCerrado: result.pedidoCerrado
            });
        })
        .catch(error => {
            console.log(error)
            const status = error.status || 400;
            const msg = error.status
                ? error.message
                : 'Ha ocurrido un error, por favor intente más tarde';
            return res.status(status).json({ msg });
        });
    },
};

