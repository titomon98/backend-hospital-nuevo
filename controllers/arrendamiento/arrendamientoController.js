'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Arrendamiento = db.arrendamientos;
const Op = db.Sequelize.Op;
const Clinica = db.clinicas;
const Medico = db.medicos;
const Especialidad = db.especialidades;
const Centro = db.centros;

module.exports = {
    create(req, res) {
        let form = req.body.form
        const datos = {
            inicio: form.start,
            fin: form.end,
            costo: form.price,
            id_clinica: form.clinic.id,
            id_medico: form.medic.id,
            estado: 1
        };

        Arrendamiento.create(datos)
        .then(arrendamiento => {
        res.send(arrendamiento);

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

        if(columna == 'clinica'){
            var conditionClinica = busqueda ? { [Op.or]: [{ numero: { [Op.like]: `%${busqueda}%` } }] } : null ;
            var condition = null;
        } else {
            var condition = busqueda ? { [Op.or]: [{ [columna]: { [Op.like]: `%${busqueda}%` } }] } : null ;
            var conditionClinica = null ;
        }


        const { limit, offset } = getPagination(page, size);

        Arrendamiento.findAndCountAll({ 
            include: [
                {
                    model: Medico,
                    require: true,
                    where: condition,
                    include: [
                        {
                            model: Especialidad,
                            require: true
                        }
                    ]
                },
                {
                    model: Clinica,
                    require: true,
                    where: conditionClinica,
                    include: [
                        {
                            model: Centro,
                            require: true
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
            res.status(500).send({
            message:
            err.message || "Ha ocurrido un error."
            });
        });
    },


    find (req, res) {
        const id = req.params.id;

        return Arrendamiento.findByPk(id)
        .then(arrendamiento => res.status(200).send(arrendamiento))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Arrendamiento.update(
            { 
                inicio: form.start,
                fin: form.end,
                costo: form.price,
                id_clinica: form.clinic.id,
                id_medico: form.medic.id,
             },
            { where: { 
                id: form.id 
            } }
        )
        .then(arrendamiento => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => res.status(400).send(error))
    },

    activate (req, res) {
        Arrendamiento.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(arrendamiento => res.status(200).send('El registro ha sido activado'))
        .catch(error => res.status(400).send(error))
    },

    deactivate (req, res) {
        Arrendamiento.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(arrendamiento =>res.status(200).send('El registro ha sido desactivado'))
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

