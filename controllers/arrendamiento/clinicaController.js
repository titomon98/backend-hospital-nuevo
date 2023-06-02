'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const consultaController = require('../pacientes/consultaController');
const Clinica = db.clinicas;
const Op = db.Sequelize.Op;
const Centro = db.centros;

module.exports = {
    create(req, res) {
        let form = req.body.form
        console.log(form)
        const datos = {
            numero: form.number,
            id_centro: form.site.id,
            estado: 1
        };

        Clinica.create(datos)
        .then(marca => {
        res.send(marca);

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
        const columna = req.query.columna;

        if(columna == '1'){
            var condition = busqueda ? { [Op.or]: [{ numero: { [Op.like]: `%${busqueda}%` } }] } : null ;
            var conditionSite = null;
        } else if(columna == '2'){
            var condition = null
            var conditionSite = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;
        }


        const { limit, offset } = getPagination(page, size);

        // var condition = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Clinica.findAndCountAll({ 
            include: [
                {
                    model: Centro,
                    require: true,
                    where: conditionSite
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

        return Clinica.findByPk(id)
        .then(clinica => res.status(200).send(clinica))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Clinica.update(
            { 
                numero: form.number,
                id_centro: form.site.id
             },
            { where: { 
                id: form.id 
            } }
        )
        .then(clinica => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => res.status(400).send(error))
    },

    activate (req, res) {
        Clinica.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(clinica => res.status(200).send('El registro ha sido activado'))
        .catch(error => res.status(400).send(error))
    },

    deactivate (req, res) {
        Clinica.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(clinica =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => res.status(400).send(error))
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
        var condition =busqueda?{ [Op.or]:[ {numero: { [Op.like]: `%${busqueda}%` }}],[Op.and]:[{estado:1}] } : {estado:1} ;
        Clinica.findAll({
            include: [
                {
                    model: Centro,
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

