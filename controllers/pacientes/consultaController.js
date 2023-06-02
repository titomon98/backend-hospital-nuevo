'use strict'
const Sequelize     = require('sequelize');
const moment = require('moment');
const db = require("../../models");
const Consulta = db.consultas;
const Medico = db.medicos;
const Paciente = db.pacientes;
const Tipo_medico = db.tipo_medicos;
const Especialidad = db.especialidades;
const Idioma = db.idiomas;
const Nacionalidad = db.nacionalidades;
const Sangre = db.tipo_sangres;
const Op = db.Sequelize.Op;
const { check, validationResult } = require('express-validator');

module.exports = {
    create(req, res) {
        let form = req.body.form
        console.log(form)
        const datos = {
            title: form.title,
            start: form.start,
            startDate: form.startDate,
            hora_entrada: form.hora_entrada,
            referido: form.referred,
            id_paciente: form.patient[0].id,
            id_medico: form.doctor[0].id,
            estado: 1,
            estado_consulta: 1
        };

        Consulta.create(datos)
        .then(consulta => {
            res.send(consulta);
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

        Consulta.findAndCountAll({ where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

            console.log('data: '+JSON.stringify(data))
            const response = getPagingData(data, page, limit);
            console.log('response: '+JSON.stringify(response))
            res.send({total:response.totalItems,last_page:response.totalPages,current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
            res.send({total:response.totalItems,last_page:response.totalPages,current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(err => {
            res.status(500).send({
            message:
            err.message || "Ha ocurrido un error."
            });
        });
    },

    calendar (req, res) {
        const {start, end} = req.query
        console.log(req.query)

        
        let start2 = moment(start).format('YYYY-MM-DD');
        let end2 = moment(end).format('YYYY-MM-DD');

        return Consulta.findAll({
            include: [
                {
                    model: Medico,
                    require: true,
                    include: [
                        {
                            model: Tipo_medico,
                            require: true,
                        },
                        {
                            model: Especialidad,
                            require: true,
                        }
                    ]
                },
                {
                    model: Paciente,
                    require: true,
                    include: [
                        {
                            model: Idioma,
                            as: 'idiomas',
                            require: true,
                        },
                        {
                            model: Nacionalidad,
                            as: 'nacionalidades',
                            require: true,
                        },
                        {
                            model: Sangre,
                            as: 'tipo_sangres',
                            require: true,
                        }
                    ]
                }
            ],
            where: {
                startDate: {
                    [Op.between]: [
                        start2,
                        end2,
                    ]
                },
            }
        })

        .then(consulta => {
            // console.log(consulta)
            res.status(200).send(consulta);
            // console.log(element.start)
            // let object_send;
            // let consulta_date = new Date(element.start);
            // if (consulta_date > start_dt && consulta_date < end_dt){
            //     object_send
            // }
        })
        .catch(error => res.status(400).send(error));

        //Enviar a front
    },

    find (req, res) {
        const id = req.params.id;

        return Consulta.findByPk(id)
        .then(consulta => res.status(200).send(consulta))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Consulta.update({
            title: form.title,
            start: form.start,
            startDate: form.startDate,
            hora_entrada: form.hora_entrada,
            referido: form.referred,
            id_paciente: form.patient[0].id,
            id_medico: form.doctor[0].id,
            estado: 1,
            estado_consulta: 1
        },{ where: {
            id: form.id
        }})
        .then(consulta => {
            res.send(consulta);
        })
        .catch(err => {
            console.log(err)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    activate (req, res) {
        Consulta.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(consulta => res.status(200).send('El registro ha sido activado'))
        .catch(error => res.status(400).send(error))
    },

    deactivate (req, res) {
        Consulta.update({ 
            estado: 0 
        },
        { 
            where: { 
                id: req.body.id 
            }
        }
        )
        .then(consulta =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => res.status(400).send(error))
    },

    get (req, res) {
        const { id } = req.query;
        // Validación de backend
        if (!(id)) {
            return res.status(400).send("No llenó todos los campos");
        }
        Consulta.findAndCountAll({
            include: [
                {
                    model: Medico,
                    require: true,
                    include: [
                        {
                            model: Tipo_medico,
                            require: true,
                        },
                        {
                            model: Especialidad,
                            require: true,
                        }
                    ]
                }
            ]
        }, { where: { id_paciente: id } })
        .then(data => {
            console.log(data)
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    async delete (req, res) {
        // console.log(req)
        try {
            let consulta = await Consulta.destroy({
                where: {
                  id: req.body.id
                },
                force: true
              });
            res.status(200).send('El registro ha sido eliminado')
        } catch (error) {
            console.log(error);
            res.status(400).send(error)
        }
    },
    

    //Encontrar solo calendario de hoy
    waitList (req, res) {
        //Tomar fecha de hoy
        const TODAY_START = moment().format('YYYY-MM-DD');
        // const NOW = moment().format('YYYY-MM-DD 23:59');

        //Comenzar con funcion normal

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


        Consulta.findAndCountAll({
            include: [
                {
                    model: Medico,
                    require: true,
                    include: [
                        {
                            model: Tipo_medico,
                            require: true,
                        },
                        {
                            model: Especialidad,
                            require: true,
                        }
                    ]
                },
                {
                    model: Paciente,
                    require: true,
                    include: [
                        {
                            model: Idioma,
                            as: 'idiomas',
                            require: true,
                        },
                        {
                            model: Nacionalidad,
                            as: 'nacionalidades',
                            require: true,
                        },
                        {
                            model: Sangre,
                            as: 'tipo_sangres',
                            require: true,
                        }
                    ]
                },
            ],
            where: { //se debe enviar la condicion con el operador antes de los objetos
                startDate: TODAY_START,
                estado_consulta: 2,
            }
            ,order:[['start', 'ASC']],limit,offset})
        .then(data => {

            console.log('data: '+JSON.stringify(data))
            const response = getPagingData(data, page, limit);

            console.log('response: '+JSON.stringify(response))
            res.send({total:response.totalItems,last_page:response.totalPages,current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(err => {
            res.status(500).send({
            message:
            err.message || "Ha ocurrido un error."
            });
        });
        
    },

    todayCalendar (req, res) {
        //Tomar fecha de hoy
        const TODAY_START = moment().format('YYYY-MM-DD');
        // const NOW = moment().format('YYYY-MM-DD 23:59');

        //Comenzar con funcion normal

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


        Consulta.findAndCountAll({
            include: [
                {
                    model: Medico,
                    require: true,
                    include: [
                        {
                            model: Tipo_medico,
                            require: true,
                        },
                        {
                            model: Especialidad,
                            require: true,
                        }
                    ]
                },
                {
                    model: Paciente,
                    require: true,
                    include: [
                        {
                            model: Idioma,
                            as: 'idiomas',
                            require: true,
                        },
                        {
                            model: Nacionalidad,
                            as: 'nacionalidades',
                            require: true,
                        },
                        {
                            model: Sangre,
                            as: 'tipo_sangres',
                            require: true,
                        }
                    ]
                },
            ],
            where: { //se debe enviar la condicion con el operador antes de los objetos
                startDate: TODAY_START,
                estado_consulta: 1,
            }
            ,order:[['start', 'ASC']],limit,offset})
        .then(data => {

            console.log('data: '+JSON.stringify(data))
            const response = getPagingData(data, page, limit);

            console.log('response: '+JSON.stringify(response))
            res.send({total:response.totalItems,last_page:response.totalPages, current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(err => {
            res.status(500).send({
            message:
            err.message || "Ha ocurrido un error."
            });
        });
        
    },

    //Encontrar consultas atrasadas del dia de hoy
    findDelayed (req, res) {
        //Tomar fecha de hoy
        const TODAY_START = moment().format('YYYY-MM-DD 00:00');
        const NOW = moment().subtract(0, 'h').format();

        //Comenzar con funcion normal
        return Consulta.findAll({
            where: { //se debe enviar la condicion con el operador antes de los objetos
                start: {
                    [Op.between]: [
                        TODAY_START,
                        NOW,
                    ]
                },
            },
            include: [
                {
                    model: Medico,
                    require: true,
                    include: [
                        {
                            model: Tipo_medico,
                            require: true,
                        },
                        {
                            model: Especialidad,
                            require: true,
                        }
                    ]
                },
                {
                    model: Paciente,
                    require: true,
                    include: [
                        {
                            model: Idioma,
                            as: 'idiomas',
                            require: true,
                        },
                        {
                            model: Nacionalidad,
                            as: 'nacionalidades',
                            require: true,
                        },
                        {
                            model: Sangre,
                            as: 'tipo_sangres',
                            require: true,
                        }
                    ]
                },
            ]
        })
        .then(consulta => res.status(200).send(consulta))
        .catch(error => res.status(400).send(error));
    },

    //Encontrar consultas a tiempo del dia de hoy
    findOnTime (req, res) {
        //Tomar fecha de hoy
        let TODAY_END = moment().format('YYYY-MM-DD 00:00');
        const NOW = moment().subtract(0, 'h').format();

        TODAY_END = moment().add(1, 'd').format()

        //Comenzar con funcion normal
        return Consulta.findAll({
            where: { //se debe enviar la condicion con el operador antes de los objetos
                start: {
                    [Op.between]: [
                        NOW,
                        TODAY_END,
                    ]
                },
            },
            include: [
                {
                    model: Medico,
                    require: true,
                    include: [
                        {
                            model: Tipo_medico,
                            require: true,
                        },
                        {
                            model: Especialidad,
                            require: true,
                        }
                    ]
                },
                {
                    model: Paciente,
                    require: true,
                    include: [
                        {
                            model: Idioma,
                            as: 'idiomas',
                            require: true,
                        },
                        {
                            model: Nacionalidad,
                            as: 'nacionalidades',
                            require: true,
                        },
                        {
                            model: Sangre,
                            as: 'tipo_sangres',
                            require: true,
                        }
                    ]
                },
            ]
        })
        .then(consulta => res.status(200).send(consulta))
        .catch(error => res.status(400).send(error));
    },

    //Encontrar consultas canceladas
    findCanceled (req, res) {
        const id = req.params.id;

        return Consulta.findByPk(id)
        .then(consulta => res.status(200).send(consulta))
        .catch(error => res.status(400).send(error))
    },

    //Encontrar referidos por medico
    findByMedic (req, res) {
        const id = req.params.id;

        return Consulta.findByPk(id)
        .then(consulta => res.status(200).send(consulta))
        .catch(error => res.status(400).send(error))
    },

    //Encontrar referidos por secretaria
    findBySecretary (req, res) {
        const id = req.params.id;

        return Consulta.findByPk(id)
        .then(consulta => res.status(200).send(consulta))
        .catch(error => res.status(400).send(error))
    },

    sendWaitList(req, res){
        const id = req.body.id;
        console.log(id)
        
        Consulta.update(
            { 
                estado_consulta: 2
            },
            { where: { 
                id: id 
            } }
        )
        .then(data => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => res.status(400).send(error))
    },

    sendHistory(req, res){
        const id = req.body.id;
        console.log(id)
        
        Consulta.update(
            { 
                estado_consulta: 3
            },
            { where: { 
                id: id 
            } }
        )
        .then(data => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => res.status(400).send(error))
    },
    
    listConsultapaciente(req, res) {
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
        const patientid  = req.query.id;

        const { limit, offset } = getPagination(page, size);

        var condition = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Consulta.findAndCountAll({
            include: [
                {
                    model: Medico,
                    require: true,
                    include: [
                        {
                            model: Tipo_medico,
                            require: true,
                        },
                        {
                            model: Especialidad,
                            require: true,
                        }
                    ]
                },
            ],
            where: {id_paciente:patientid},order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

            console.log('data: '+JSON.stringify(data))
            const response = getPagingData(data, page, limit);
            console.log('response: '+JSON.stringify(response))
            res.send({total:response.totalItems,last_page:response.totalPages,current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
            res.send({total:response.totalItems,last_page:response.totalPages,current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(err => {
            res.status(500).send({
            message:
            err.message || "Ha ocurrido un error."
            });
        });
    },

    visitasConsultapaciente(req, res) {
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
        const patientid  = req.query.id;

        const { limit, offset } = getPagination(page, size);

        var condition = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Consulta.findAndCountAll({
            include: [
                {
                    model: Medico,
                    require: true,
                    include: [
                        {
                            model: Tipo_medico,
                            require: true,
                        },
                        {
                            model: Especialidad,
                            require: true,
                        }
                    ]
                },
            ],
            where: {id_paciente:patientid, estado: 3},order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

            console.log('data: '+JSON.stringify(data))
            const response = getPagingData(data, page, limit);
            console.log('response: '+JSON.stringify(response))
            res.send({total:response.totalItems,last_page:response.totalPages,current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
            res.send({total:response.totalItems,last_page:response.totalPages,current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(err => {
            res.status(500).send({
            message:
            err.message || "Ha ocurrido un error."
            });
        });
    },
};
