'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const EquipmentType = db.tipo_equipos;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form
        const datos = {
            nombre: form.name,
            estado: 1
        };

        EquipmentType.create(datos)
        .then(tipo => {
        res.send(tipo);

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

        EquipmentType.findAndCountAll({ where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {
        const response = getPagingData(data, page, limit);
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

        return EquipmentType.findByPk(id)
        .then(EquipmentType => res.status(200).send(EquipmentType))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        EquipmentType.update(
            { nombre: form.name },
            { where: { 
                id: form.id 
            } }
        )
        .then(EquipmentType => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => res.status(400).send(error))
    },

    activate (req, res) {
        EquipmentType.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(EquipmentType => res.status(200).send('El registro ha sido activado'))
        .catch(error => res.status(400).send(error))
    },

    deactivate (req, res) {
        EquipmentType.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(EquipmentType =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => res.status(400).send(error))
    },
    
    get (req, res) {
        EquipmentType.findAll({attributes: ['id', 'nombre']})
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

