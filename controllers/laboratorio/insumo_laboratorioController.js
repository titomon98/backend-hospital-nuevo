'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const consultaController = require('../laboratorio/insumo_laboratorioController');
const Insumo = db.insumos_laboratorios;
const Op = db.Sequelize.Op;
const Tipo_Insumo = db.tipo_insumo_laboratorios;

module.exports = {
    create(req, res) {
        let form = req.body.form
        console.log(form)
        const datos = {
            nombre: form.name,
            codigo: form.code,
            existencia_total: '0',
            id_tipo_insumo_laboratorios: form.type.id,
            estado: 1
        };

        Insumo.create(datos)
        .then(Insumo => {
        res.send(Insumo);

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

        if(columna == 'tipo'){
            var condition = null
            var conditionType = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;
        } else {
            var condition = busqueda ? { [Op.or]: [{ [columna]: { [Op.like]: `%${busqueda}%` } }] } : null ;
            var conditionSite = null;
        }


        const { limit, offset } = getPagination(page, size);

        // var condition = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Insumo.findAndCountAll({ 
            include: [
                {
                    model: Tipo_Insumo,
                    require: true,
                    where: conditionType
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

        return Insumo.findByPk(id)
        .then(Insumo => res.status(200).send(Insumo))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Insumo.update(
            { 
                nombre: form.name,
                codigo: form.code,
                existencia_total: form.existenceTotal,
                id_centro: form.site.id
             },
            { where: { 
                id: form.id 
            } }
        )
        .then(Insumo => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => res.status(400).send(error))
    },

    activate (req, res) {
        Insumo.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(Insumo => res.status(200).send('El registro ha sido activado'))
        .catch(error => res.status(400).send(error))
    },

    deactivate (req, res) {
        Insumo.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(Insumo =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => res.status(400).send(error))
    },
    get (req, res) {
        Tipo_Insumo.findAll({attributes: ['id', 'nombre']})
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
        var condition = busqueda?{ [Op.or]:[ {nombre: { [Op.like]: `%${busqueda}%` }}],[Op.and]:[{estado:1}] } : {estado:1} ;
        Insumo.findAll({
            include: [
                {
                    model: Tipo_Insumo,
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
    },
    get (req, res) {
        Tipo_Insumo.findAll({attributes: ['id', 'nombre']})
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
