'use strict'
const Sequelize     = require('sequelize');
const { sequelize } = require('../../models');
const db = require("../../models");
const Inventario = db.inventarios;
const Op = db.Sequelize.Op;
const Medicina = db.medicamentos;
const Marca = db.marcas;
const Tipo_medicamento = db.tipo_medicamentos;
const Presentacion = db.presentaciones;
const MedicalHouse = db.casa_medicas;

module.exports = {
    async create(req, res) {
        let form = req.body.form
        const transaction = await sequelize.transaction();
        try {
            
            const inventory = await Inventario.create({
                existencia: form.existence,
                existencia_minima: form.minimalExistence,
                precio_costo: form.costPrice,
                precio_publico: form.publicPrice,
                id_medicamento: form.medicine.id,
                estado: 1
            }, {transaction: transaction});

            Medicina.update({
                existencia_total: form.existence
            },
            {
                where: {id: form.medicine.id }
            }, {transaction: transaction});

            res.status(200).send('El registro ha sido guadado exitosamente');
            await transaction.commit();
        } catch (error) {
            console.log(error)
            res.status(400).send('Ocurrió un error al generar registro, por favor intente más tarde.');   
            await transaction.rollback();
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
                    model: Medicina,
                    require: true,
                    where: condition,
                    include: [
                        {
                            model: Marca,
                            require: true,
                            include: [
                                {
                                    model: MedicalHouse,
                                    require:true
                                }
                            ]
                        },
                        {
                            model: Tipo_medicamento,
                            require: true,
                        },
                        {
                            model: Presentacion,
                            require: true,
                        }
                    ]
                }
            ],
            order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        // console.log('data: '+JSON.stringify(data))
        const response = getPagingData(data, page, limit);

        // console.log('response: '+JSON.stringify(response))
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

        return Inventario.findByPk(id)
        .then(Inventario => res.status(200).send(Inventario))
        .catch(error => res.status(400).send(error))
    },

    async update (req, res) {
        let form = req.body.form
        const transaction = await sequelize.transaction();
        try {
            await Inventario.update({
                existencia: form.existence,
                existencia_minima: form.minimalExistence,
                precio_costo: form.costPrice,
                precio_publico: form.publicPrice,
                id_medicamento: form.medicine.id,
                estado: 1
            },{ where: { id: form.id }},{transaction: transaction});

            await Medicina.update({
                existencia_total: form.existence
            },
            {
                where: {id: form.medicine.id }
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
        .then(inventario =>res.status(200).send('El registro ha sido desactivado'))
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
    },
    getSearch (req, res) {
        var busqueda = req.query.search;
        console.log(busqueda)
        var condition =busqueda?{ [Op.or]:[ {existence: { [Op.like]: `%${busqueda}%` }}],[Op.and]:[{estado:1}] } : {estado:1} ;
        Inventario.findAll({
            include: [
                {
                    model: Medicamento,
                    require: true,
                }
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

