'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Movimiento = db.quirurgico_movimientos;
const Quirurgico = db.quirurgicos;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form
        let currentUser = req.body.currentUser
        let existencia_nueva
        let descripcion

        if (form.movimiento === 'SALIDA') {
            descripcion = 'Retiro de medicamentos realizado a través de menú de movimientos por ' + currentUser.user
            existencia_nueva = parseInt(form.quirurgico.existencia_actual) - parseInt(form.cantidad)
        } else if (form.movimiento === 'ENTRADA') {
            descripcion = 'Ingreso de medicamentos realizado a través de menú de movimientos por ' + currentUser.user
            existencia_nueva = parseInt(form.quirurgico.existencia_actual) + parseInt(form.cantidad)
        }

        const datos = {
            cantidad: form.cantidad,
            existencia_previa: form.quirurgico.existencia_actual,
            existencia_nueva: existencia_nueva,
            precio_costo: form.precio_costo,
            precio_venta: form.precio_venta,
            movimiento: form.movimiento,
            id_quirurgico: form.quirurgico.id,
            descripcion: descripcion,
            estado: 1
        };

        Quirurgico.update({ 
            existencia_actual: existencia_nueva
        },
        { where: { 
            id: form.quirurgico.id 
        }})

        Movimiento.create(datos)
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

        Movimiento.findAndCountAll({ where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
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

        return Movimiento.findByPk(id)
        .then(banco => res.status(200).send(banco))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Movimiento.update(
            { 
                cantidad: form.cantidad,
                existencia_previa: form.existencia_previa,
                precio_costo: form.precio_costo,
                precio_venta: form.precio_venta,
                movimiento: form.movimiento,
                id_quirurgico: form.quirurgico.id,
            },
            { where: { 
                id: form.id 
            } }
        )
        .then(banco => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    activate (req, res) {
        Movimiento.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(banco => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    deactivate (req, res) {
        Movimiento.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(banco =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    get (req, res) {
        Movimiento.findAll({attributes: ['id', 'nombre']})
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
        var condition = busqueda?{ [Op.or]:[ {nombre: { [Op.like]: `%${busqueda}%` }}],[Op.and]:[{estado:1}] } : {estado:1} ;
        Movimiento.findAll({
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

