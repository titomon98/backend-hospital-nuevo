'use strict'
const { where } = require('sequelize');
const Sequelize     = require('sequelize');
const db = require("../../models");
const consultaController = require('../pacientes/consultaController');
const Medicina = db.medicamentos;
const Op = db.Sequelize.Op;
const Marca = db.marcas;
const Tipo_medicamento = db.tipo_medicamentos;
const Presentacion = db.presentaciones;
const MedicalHouse = db.casa_medicas;

module.exports = {
    create(req, res) {
        let form = req.body.form
        const datos = {
            nombre: form.name,
            codigo: form.code,
            id_marca: form.brand.id,
            id_tipo_medicamento: form.medicationType.id,
            id_presentacion: form.presentation.id,
            estado: 1
        };

        Medicina.create(datos)
        .then(Medicina => {
        res.send(Medicina);

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
        const columna = req.query.columna;

        if(columna == 'marca'){
            var conditionBrand = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ; 
            var conditionType = null;
            var conditionPres = null;
            var condition = null;
        } else if(columna == 'tipo'){
            var conditionType = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ; 
            var conditionBrand = null;
            var conditionPres = null;
            var condition = null;
        } else if(columna == 'presentacion'){
            var conditionPres = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ; 
            var conditionBrand = null;
            var conditionType
            var condition = null;
        } else {
            var condition = busqueda ? { [Op.or]: [{[columna]: { [Op.like]: `%${busqueda}%` } }] } : null ; 
            var conditionEspe = null;
            var conditionType = null;
            var conditionPres = null;
        }


        const { limit, offset } = getPagination(page, size);

        // var condition = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Medicina.findAndCountAll({ 
            include: [
                {
                    model: Marca,
                    require: true,
                    where: conditionBrand,
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
                    where: conditionType
                },
                {
                    model: Presentacion,
                    require: true,
                    where: conditionPres
                }
            ],
        where: condition ,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {
        const response = getPagingData(data, page, limit);
        res.send({total:response.totalItems,last_page:response.totalPages,current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },


    find (req, res) {
        const id = req.params.id;

        return Medicina.findByPk(id)
        .then(paciente => res.status(200).send(paciente))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Medicina.update(
            { 
                nombre: form.name,
                codigo: form.code,
                id_marca: form.brand.id,
                id_tipo_medicamento: form.medicationType.id,
                id_presentacion: form.presentation.id,
            },
            { where: { 
                id: form.id 
            } }
        )
        .then(medicina => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    activate (req, res) {
        Medicina.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(Medicina => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    deactivate (req, res) {
        Medicina.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(Medicina =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    
    getSearch (req, res) {
        var busqueda = req.query.search;
        var condition = busqueda?{ [Op.or]:[ {nombre: { [Op.like]: `%${busqueda}%` }}],[Op.and]:[{estado:1}] } : {estado:1} ;
        Medicina.findAll({
            include: [
                {
                    model: Marca,
                    require: true,
                },
                {
                    model: Tipo_medicamento,
                    require: true,
                },
                {
                    model: Presentacion,
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

