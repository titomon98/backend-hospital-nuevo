'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Nota = db.notas;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form
        const datos = {
            nombre: form.name,
            estado: 1
        };

        Nota.create(datos)
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


        const { limit, offset } = getPagination(page, size);

        var condition = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Nota.findAndCountAll({ where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
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

        return Nota.findByPk(id)
        .then(nota => res.status(200).send(nota))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Nota.update(
            { nombre: form.name },
            { where: { 
                id: form.id 
            } }
        )
        .then(nota => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => res.status(400).send(error))
    },

    activate (req, res) {
        Nota.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(nota => res.status(200).send('El registro ha sido activado'))
        .catch(error => res.status(400).send(error))
    },

    deactivate (req, res) {
        Nota.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(nota =>res.status(200).send('El registro ha sido desactivado'))
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
    }
};

