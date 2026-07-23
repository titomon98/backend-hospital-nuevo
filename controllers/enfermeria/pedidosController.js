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

// Helper reutilizable: crea la cabecera del pedido + sus lineas. NO mueve
// existencias ni responde HTTP (eso lo hace quien lo llama). Devuelve el pedido
// creado. Lo usan tanto pedidosController.create como los consumos de farmacia
// (que generan un pedido automatico al descontar). Ver SURTIR_DETALLE.md.
async function crearPedido({ codigoPedido, fecha, id_usuario, cantidadUnidades, picked, detalle }) {
    // destino de las lineas: 1 = enfermeria (existencia_actual_farmacia),
    // 2 = quirofano (existencia_actual_quirofano). Se deriva de "picked"
    // (0 = farmacia, 1 = quirofano).
    const destino = parseInt(picked) === 1 ? 2 : 1;

    const pedido = await Pedido.create({
        codigoPedido,
        fecha,
        id_usuario,
        cantidadUnidades,
        estado: 1
    });

    const detalles = detalle || [];
    const filas = detalles.map(item => {
        const datos_detalles = {
            cantidad: parseInt(item.cantidad),
            descripcion: item.nombre,
            estado: 1,
            destino: destino,
            id_pedido: pedido.id
        };
        if (item.is_medicine === true) {
            datos_detalles.id_medicamento = item.id_medicine;
        } else if (item.is_quirurgico === true) {
            datos_detalles.id_quirurgico = item.id_quirurgico;
        } else if (item.is_comun === true) {
            datos_detalles.id_comun = item.id_comun;
        }
        return datos_detalles;
    });

    await Promise.all(filas.map(f => DetallePedido.create(f)));
    return pedido;
}

// Genera un pedido AUTOMATICO a partir de un consumo de farmacia. El codigo se
// autogenera con fecha/hora para no colisionar/truncarse con codigos previos.
// destino segun el movimiento del consumo: SALIDAQ = quirofano, resto = farmacia.
// detalleItem lleva el tipo (is_medicine/is_quirurgico/is_comun), el id del
// producto y la cantidad consumida.
async function crearPedidoAutomatico({ id_usuario, movimiento, cantidad, detalleItem }) {
    // Hora actual de Guatemala (GMT-6, sin horario de verano), independiente de la
    // zona horaria del servidor. No restar horas: se quiere la hora real.
    const ahora = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guatemala' }));
    // Prefijo del codigo = area donde se suministro, segun el movimiento.
    const areas = {
        SALIDAQ: 'QUIROFANO',
        SALIDAH: 'HOSPITALIZACION',
        SALIDAI: 'INTENSIVO',
        SALIDAE: 'EMERGENCIA'
    };
    const area = areas[movimiento] || 'AUTOMATICO';

    const dosDigitos = (n) => String(n).padStart(2, '0');
    const codigoPedido = area + '-' +
        dosDigitos(ahora.getDate()) + '-' +
        dosDigitos(ahora.getMonth() + 1) + '-' +
        ahora.getFullYear() + '-' +
        dosDigitos(ahora.getHours()) + '-' +
        dosDigitos(ahora.getMinutes()) + '-' +
        dosDigitos(ahora.getSeconds());

    // SALIDAQ (quirofano) -> picked 1 -> destino 2; resto -> picked 0 -> destino 1.
    const picked = movimiento === 'SALIDAQ' ? 1 : 0;

    return crearPedido({
        codigoPedido,
        fecha: ahora,
        id_usuario,
        cantidadUnidades: parseInt(cantidad),
        picked,
        detalle: [detalleItem]
    });
}

module.exports = {
    // El create YA NO mueve existencias. El traslado (restar de existencia_actual
    // y sumar al area destino) ocurre al surtir cada linea en
    // detallePedidosController.surtir. Aqui solo se crean cabecera y lineas.
    create(req, res) {
        crearPedido(req.body)
        .then(pedido => res.send(pedido))
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

// Exportado aparte para que los consumos de farmacia puedan generar un pedido
// automatico reutilizando exactamente la misma logica que /pedidos/create.
module.exports.crearPedido = crearPedido;
module.exports.crearPedidoAutomatico = crearPedidoAutomatico;

