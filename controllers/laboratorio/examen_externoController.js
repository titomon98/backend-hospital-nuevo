'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Examen = db.examen_externos;
const TipoExamen = db.tipo_examenes;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form
        const datos = {
            nombre: form.name,
            id_tipo_examen: form.examType.id,
            estado: 1
        };

        Examen.create(datos)
        .then(examen => {
        res.send(examen);

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

        if(columna == 'tipoExamen'){
            var conditionTipoE = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;
            var condition = null;
        } else {
            var condition = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;
            var conditionTipoE = null ;
        }


        const { limit, offset } = getPagination(page, size);


        Examen.findAndCountAll({ include: [
                {
                    model: TipoExamen,
                    require: true,
                    where: conditionTipoE
                }
            ],
            where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {
        const response = getPagingData(data, page, limit);
        res.send({total:response.totalItems,last_page:response.totalPages, current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
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

        return Examen.findByPk(id)
        .then(Examen => res.status(200).send(Examen))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Examen.update(
            { nombre: form.name },
            { where: { 
                id: form.id 
            } }
        )
        .then(Examen => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => res.status(400).send(error))
    },

    activate (req, res) {
        Examen.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(Examen => res.status(200).send('El registro ha sido activado'))
        .catch(error => res.status(400).send(error))
    },

    deactivate (req, res) {
        Examen.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(Examen =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => res.status(400).send(error))
    },

    get (req, res) {
        Examen.findAll({attributes: ['id', 'nombre']})
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
        Examen.findAll({
            include: [
                {
                    model: TipoExamen,
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

