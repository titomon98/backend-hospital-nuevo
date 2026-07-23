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

    // Surtir UN item del pedido: suma la existencia al area destino del pedido
    // (picked: 0 = Farmacia, 1 = Quirofano) y marca el item como surtido (estado 2).
    // Cuando ya no quedan items pendientes, el pedido se cierra (estado 0).
    async surtir (req, res) {
        try {
            const id = req.body.id;
            const detalle = await DetallePedido.findByPk(id);
            if (!detalle) {
                return res.status(404).json({ msg: 'Detalle de pedido no encontrado' });
            }
            if (detalle.estado === 2) {
                return res.status(400).json({ msg: 'Este item ya fue surtido' });
            }

            const pedido = await Pedido.findByPk(detalle.id_pedido);
            const columna = (pedido && pedido.picked === 1)
                ? 'existencia_actual_quirofano'
                : 'existencia_actual_farmacia';
            const cantidad = parseInt(detalle.cantidad) || 0;

            if (detalle.id_medicamento) {
                await Medicamento.increment(columna, { by: cantidad, where: { id: detalle.id_medicamento } });
            } else if (detalle.id_quirurgico) {
                await Quirurgico.increment(columna, { by: cantidad, where: { id: detalle.id_quirurgico } });
            } else if (detalle.id_comun) {
                await Comunes.increment(columna, { by: cantidad, where: { id: detalle.id_comun } });
            }

            detalle.estado = 2;
            await detalle.save();

            // Si ya no quedan items pendientes, cerrar el pedido.
            const pendientes = await DetallePedido.count({
                where: { id_pedido: detalle.id_pedido, estado: 1 }
            });
            if (pendientes === 0 && pedido) {
                pedido.estado = 0;
                await pedido.save();
            }

            return res.send({ msg: 'Item surtido correctamente', pedidoCerrado: pendientes === 0 });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },
};

