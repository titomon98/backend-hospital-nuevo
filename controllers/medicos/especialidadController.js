'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Specialty = db.especialidades;
const Op = db.Sequelize.Op;

module.exports = {
    async create(req, res) {
        let form = req.body.form
        const datos = {
            nombre: form.name,
            estado: 1
        };

        let specialty = await Specialty.findOne({ where: { nombre: datos.nombre } });

        if (specialty) {
            return res.status(400).json({ msg: 'La especialidad ya fue registrado previamente' });
        }

        Specialty.create(datos)
        .then(specialty => {
        res.send(specialty);

        })
        .catch(err => {
            console.log(err)
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

        Specialty.findAndCountAll({ where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        console.log('data: '+JSON.stringify(data))
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems,last_page:response.totalPages,from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(err => {
            console.log(err)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },


    find (req, res) {
        const id = req.params.id;

        return Specialty.findByPk(id)
        .then(specialty => res.status(200).send(specialty))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Specialty.update(
            { nombre: form.name },
            { where: { 
                id: form.id 
            } }
        )
        .then(specialty => res.status(200).send('El registro ha sido actualizado'))
        .catch(err => {
            console.log(err)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    activate (req, res) {
        Specialty.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(specialty => res.status(200).send('El registro ha sido activado'))
        .catch(err => {
            console.log(err)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    deactivate (req, res) {
        Specialty.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(specialty =>res.status(200).send('El registro ha sido desactivado'))
        .catch(err => {
            console.log(err)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    get (req, res) {
        Specialty.findAll({attributes: ['id', 'nombre']})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            console.log(err)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    }
};

