'use strict'
const { where } = require('sequelize');
const Sequelize     = require('sequelize');
const db = require("../../models");
const consultaController = require('../pacientes/consultaController');
const Medico = db.medicos;
const Op = db.Sequelize.Op;
const Tipo_medico = db.tipo_medicos;
const Especialidad = db.especialidades;

module.exports = {
    create(req, res) {
        let form = req.body.form
        console.log(form);
        const datos = {
            nombre: form.name,
            apellido: form.secondName,
            colegiado: form.collegeNumber,
            direccion: form.address,
            telefono: form.phoneNumber,
            correo: form.email,
            id_especialidad: form.specialty.id,
            id_tipo_medico: form.type.id,
            estado: 1
        };

        Medico.create(datos)
        .then(Medico => {
        res.send(Medico);

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

        if(columna == 'especialidad'){
            var conditionEspe = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ; 
            var condition = null;
            var conditionType = null;
        } else if(columna == 'tipo'){
            var conditionType = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ; 
            var conditionEspe = null;
            var condition = null;
        } else {
            var condition = busqueda ? { [Op.or]: [{[columna]: { [Op.like]: `%${busqueda}%` } }] } : null ; 
            var conditionEspe = null;
            var conditionType = null;
        }


        const { limit, offset } = getPagination(page, size);

        // var condition = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Medico.findAndCountAll({ 
            include: [
                {
                    model: Tipo_medico,
                    require: true,
                    where: conditionType
                },
                {
                    model: Especialidad,
                    require: true,
                    where: conditionEspe
                }
            ],
        where: condition ,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        console.log('data: '+JSON.stringify(data))
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems,last_page:response.totalPages,from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },


    find (req, res) {
        const id = req.params.id;

        return Medico.findByPk(id)
        .then(paciente => res.status(200).send(paciente))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        console.log(form)
        Medico.update(
            { 
                nombre: form.name,
                apellido: form.secondName,
                colegiado: form.collegeNumber,
                direccion: form.address,
                telefono: form.phoneNumber,
                correo: form.email,
                id_especialidad: form.specialty.id,
                id_tipo_medico: form.type.id,
            },
            { where: { 
                id: form.id 
            } }
        )
        .then(paciente => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    activate (req, res) {
        Medico.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(Medico => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    deactivate (req, res) {
        Medico.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(Medico =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    getSearch (req, res) {
        var busqueda = req.query.search;
        var condition =busqueda?{ [Op.or]:[ {nombre: { [Op.like]: `%${busqueda}%` }}],[Op.and]:[{estado:1}] } : {estado:1} ;
        Medico.findAll({attributes: ['id', 'nombre', 'apellido', 'colegiado'],
            include: [
                {
                    model: Tipo_medico,
                    require: true,
                },
                {
                    model: Especialidad,
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

