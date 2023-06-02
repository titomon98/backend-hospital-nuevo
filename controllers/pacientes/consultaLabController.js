'use strict'
const Sequelize     = require('sequelize');
const moment = require('moment');
const db = require("../../models");
const Consulta = db.consulta_laboratorios;
const Paciente = db.pacientes;
const Examen = db.examenes;
const Tipo = db.tipo_examenes;
const Idioma = db.idiomas;
const Nacionalidad = db.nacionalidades;
const Sangre = db.tipo_sangres;
const Record = db.records;
const DetailRecords = db.detail_records;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form
        let title = `${form.patient[0].nombre} ${form.patient[0].apellidos} - ${form.title}`

        const datosConsulta = {
            start: form.start,
            startDate: form.startDate,
            hora_entrada: form.startTime.startTime, //Revisar si el startTime esta bien
            referido: form.referred,
            id_paciente: form.patient[0].id,
            id_examen: form.exam[0].id, //PEDRO AQUI CAMBIA POR EL ID DEL EXAMEN
            estado: 1,
            estado_consulta: 1,
            title: title
        }
        Consulta.create(datosConsulta).then(consulta => {
            res.send(consulta);
        })
        .catch(err => {
            console.log(err)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });;
                    
    },

    update (req, res) {
        let form = req.body.form
        console.log(form)
        Consulta.update({
            title: form.title,
            start: form.start,
            startDate: form.startDate,
            referido: form.referred,
            id_paciente: form.patient[0].id,
            id_examen: form.exam[0].id,
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

    async delete (req, res) {
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

    calendar (req, res) {
        const {start, end} = req.query
        console.log(req.query)

        
        let start2 = moment(start).format('YYYY-MM-DD');
        let end2 = moment(end).format('YYYY-MM-DD');

        return Consulta.findAll({
            include: [
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
                {
                    model: Examen,
                    require: true,
                    include: [
                        {
                            model: Tipo,
                            require: true,
                        },
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
        .catch(error => {
            console.log(error)
            res.status(400).send(error)
        });

        //Enviar a front
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
                {
                    model: Examen,
                    require: true,
                    include: [
                        {
                            model: Tipo,
                            require: true,
                        },
                    ]
                }
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
                {
                    model: Examen,
                    require: true,
                    include: [
                        {
                            model: Tipo,
                            require: true,
                        },
                    ]
                }
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

    sendWaitList(req, res){
        const id = req.body.id;
        // console.log(id)
        
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
        // console.log(id)
        
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
}