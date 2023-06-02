'use strict'
const Sequelize     = require('sequelize');
const moment = require('moment');
const db = require("../../models");
const Orden = db.ordenes;
const Medico = db.medicos;
const Paciente = db.pacientes;
const Tipo_medico = db.tipo_medicos;
const Especialidad = db.especialidades;
const Equipo = db.equipos;
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
            sedacion: form.sedation,
            estado_sedacion: form.sedation_status,
            id_paciente: form.id_paciente,
            id_medico: form.doctor[0].id,
            id_equipo: form.equipment[0].id,
            estado: 1,
            estado_consulta: 1
        };

        Orden.create(datos)
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
        const patientId = req.query.patientId;
        const columna = req.query.columna;


        const { limit, offset } = getPagination(page, size);

        var condition = busqueda ? { [Op.or]: [{ [columna]: { [Op.like]: `%${busqueda}%` } }], id_paciente: patientId } : null ;

        Orden.findAndCountAll({ where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
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

    calendar (req, res) {
        const {start, end} = req.query
        console.log(req.query)

        
        let start2 = moment(start).format('YYYY-MM-DD');
        let end2 = moment(end).format('YYYY-MM-DD');

        return Orden.findAll({
            include: [
                {
                    model: Medico,
                    require: false,
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
                    model: Equipo,
                    require: true,
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
            res.status(200).send(consulta);
        })
        .catch(error => res.status(400).send(error));

        //Enviar a front
    },

    find (req, res) {
        const id = req.params.id;

        return Orden.findByPk(id)
        .then(consulta => res.status(200).send(consulta))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Orden.update({
            title: form.title,
            start: form.start,
            startDate: form.startDate,
            hora_entrada: form.hora_entrada,
            referido: form.referred,
            sedacion: form.sedation,
            estado_sedacion: form.sedation_status,
            id_paciente: form.patient[0].id,
            id_medico: form.doctor[0].id,
            id_equipo: form.equipment[0].id,
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
        Orden.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(consulta => res.status(200).send('El registro ha sido activado'))
        .catch(error => res.status(400).send(error))
    },

    deactivate (req, res) {
        Orden.update({ 
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
        Orden.findAndCountAll({
            include: [
                {
                    model: Medico,
                    require: false,
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
                    model: Equipo,
                    require: true,
                },
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
            let consulta = await Orden.destroy({
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


        Orden.findAndCountAll({
            include: [
                {
                    model: Medico,
                    require: false,
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
                    model: Equipo,
                    require: true,
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
                estado: 2,
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


        Orden.findAndCountAll({
            include: [
                {
                    model: Medico,
                    require: false,
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
                    model: Equipo,
                    require: true,
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
                estado: 1,
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

    //Encontrar estudios atrasados del dia de hoy
    findDelayed (req, res) {
        //Tomar fecha de hoy
        const TODAY_START = moment().format('YYYY-MM-DD 00:00');
        const NOW = moment().subtract(0, 'h').format();

        //Comenzar con funcion normal
        return Orden.findAll({
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
                    require: false,
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
                    model: Equipo,
                    require: true,
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

    //Encontrar estudios a tiempo del dia de hoy
    findOnTime (req, res) {
        //Tomar fecha de hoy
        let TODAY_END = moment().format('YYYY-MM-DD 00:00');
        const NOW = moment().subtract(0, 'h').format();

        TODAY_END = moment().add(1, 'd').format()

        //Comenzar con funcion normal
        return Orden.findAll({
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
                    require: false,
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
                    model: Equipo,
                    require: true,
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

    //Encontrar estudios de laboratorio cancelados
    findCanceled (req, res) {
        const id = req.params.id;

        return Orden.findByPk(id)
        .then(consulta => res.status(200).send(consulta))
        .catch(error => res.status(400).send(error))
    },

    //Encontrar referidos por medico
    findByMedic (req, res) {
        const id = req.params.id;

        return Orden.findByPk(id)
        .then(consulta => res.status(200).send(consulta))
        .catch(error => res.status(400).send(error))
    },

    //Encontrar referidos por secretaria
    findBySecretary (req, res) {
        const id = req.params.id;

        return Orden.findByPk(id)
        .then(consulta => res.status(200).send(consulta))
        .catch(error => res.status(400).send(error))
    },

    sendWaitList(req, res){
        const id = req.body.id;
        console.log(id)
        
        Orden.update(
            { 
                estado: 2
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
        
        Orden.update(
            { 
                estado: 3
            },
            { where: { 
                id: id 
            } }
        )
        .then(data => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => res.status(400).send(error))
    }
};
