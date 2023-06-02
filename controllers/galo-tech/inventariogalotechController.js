'use strict'
const Sequelize     = require('sequelize');
const { sequelize } = require('../../models');
const db = require("../../models");
const Inventario = db.inventario_galo_techs;
const Equipo = db.equipo_galo_techs;
const Tipo = db.tipo_equipos;
const Op = db.Sequelize.Op;

module.exports = {
    async create(req, res) {
        let form = req.body.form
        const transaction = await sequelize.transaction();
        try {
            const inventory = await Inventario.create({
                existencia: form.stock,
                existencia_minima: form.minimalStock,
                precio_costo: form.costPrice,
                precio_publico: form.publicPrice,
                estado: 1,
                id_equipo: form.equipment.id
            }, {transaction: transaction});

            Equipo.update({
                existencia_total: form.stock
            },
            {
                where: {id: form.equipment.id }
            }, {transaction: transaction});

            res.status(200).send('El registro ha sido guadado exitosamente');
            await transaction.commit();
        } catch (error) {
            console.log(error)
            await transaction.rollback();
            res.status(400).send('Ocurrió un error al generar registro, por favor intente más tarde.');   
        }      
                    
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
        const columna = req.query.columna;


        const { limit, offset } = getPagination(page, size);

        var condition = busqueda ? { [Op.or]: [{ [columna]: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Inventario.findAndCountAll({
            include: [
                {
                    model: Equipo,
                    require: true,
                    where: condition,
                    include: [
                        {
                            model: Tipo,
                            require: true,
                        }
                    ]
                }
            ],
            order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        console.log('data: '+JSON.stringify(data))
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems,last_page:response.totalPages,from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(err => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    async update (req, res) {
        let form = req.body.form
        const transaction = await sequelize.transaction();
        try {
            console.log(form)
            await Inventario.update({
                existencia: form.stock,
                existencia_minima: form.minimalStock,
                precio_costo: form.costPrice,
                precio_publico: form.publicPrice,
                id_equipo: form.equipment.id
            },{ where: { id: form.id }},{transaction: transaction});

            await Equipo.update({
                existencia_total: form.stock
            },
            {
                where: {id: form.equipment.id }
            }, {transaction: transaction});

            res.status(200).send('El registro ha sido actualizado exitosamente');
            await transaction.commit();
        } catch (error) {
            console.log(error)
            res.status(400).send('Ocurrió un error al generar registro, por favor intente más tarde.');   
            await transaction.rollback();
        }
    },

    activate (req, res) {
        Inventario.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(inventario => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    deactivate (req, res) {
        Inventario.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(inventario => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    get (req, res) {
        Marca.findAll({attributes: ['id', 'nombre']})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
            message:
            err.message || "Ha ocurrido un error."
            });
        });
    }
};
