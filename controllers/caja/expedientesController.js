'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Expediente = db.expedientes;
const Cuenta = db.cuentas;
const Habitaciones = db.habitaciones;
const Logs = db.log_traslados;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form
        const today = new Date();
        let status = 0
        if (form.selectedOption == 'hospi') {
            status = 1
        } else if (form.selectedOption == 'emergencia') {
            status = 5
        } else if (form.selectedOption == 'quirofano') {
            status = 3
        } else if (form.selectedOption == 'intensivo') {
            status = 4
        }
        const datos = {
            nombres: form.nombre,
            apellidos: form.apellidos,
            expediente: 'TEMPORAL',
            primer_ingreso: today,
            casada: form.casada,
            nacimiento: form.nacimiento,
            cui: form.cui,
            nacionalidad: form.nacionalidad,
            telefono: form.telefono,
            direccion: form.direccion,
            genero: form.generos,
            nombre_encargado: form.nombre_encargado,
            contacto_encargado: form.contacto_encargado,
            cui_encargado: form.cui_encargado,
            parentesco_encargado: form.parentesco_encargado,
            estado: status,
            estado_civil: form.estado_civil,
            profesion: form.profesion,
            nombre_padre: form.nombre_padre,
            nombre_madre: form.nombre_madre,
            lugar_nacimiento: form.lugar_nacimiento,
            estado_civil_encargado: form.estado_civil_encargado,
            profesion_encargado: form.profesion_encargado,
            direccion_encargado: form.direccion_encargado,
            nombre_conyuge: form.nombre_conyuge,
            direccion_conyuge: form.direccion_conyuge,
            telefono_conyuge: form.telefono_conyuge
        };

        Expediente.create(datos)
        .then(expediente => {
            const expediente_id = expediente.id
            let datos_cuenta = {
                numero: 1,
                fecha_ingreso: today,
                motivo: form.motivo,
                descripcion: null,
                otros: null,
                total: 0.0,
                id_expediente: expediente_id,
                estado: 1
            }
            Cuenta.create(datos_cuenta)
                .then(res=>{
                    console.log(res)
                })
                .catch(err=>
                    console.log(err)
                )

            //Actualizar expediente
            const year = today.getFullYear();
            let resto
            var idFormateado = String(expediente_id).padStart(4, '0');
            resto = year + '-' + idFormateado
            Expediente.update(
                {
                    expediente: resto,
                },
                { where: { 
                    id: expediente_id
                }}
            )
            Habitaciones.update(
                {
                    estado: 2,
                },
                { where: { 
                    id: form.habitacion.id
                }}
            )
            res.send(expediente);
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


        const { limit, offset } = getPagination(page, size);

        var condition = busqueda ? { [Op.or]: [{ nombres: { [Op.like]: `%${busqueda}%` }, estado: {[Sequelize.Op.gte]: 0} }] } : {estado: {[Sequelize.Op.gte]: 0} } ;

        Expediente.findAndCountAll({ where: condition, order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        console.log('data: '+JSON.stringify(data))
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems,last_page:response.totalPages, current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },


    find (req, res) {
        const id = req.params.id;

        return Expediente.findByPk(id)
        .then(marca => res.status(200).send(marca))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Expediente.update(
            { 
                nombres: form.nombre,
                apellidos: form.apellidos,
                expediente: form.expediente,
                primer_ingreso: today,
                casada: form.casada,
                nacimiento: form.nacimiento,
                cui: form.cui,
                nacionalidad: form.nacionalidad,
                telefono: form.telefono,
                direccion: form.direccion,
                genero: form.generos,
                nombre_encargado: form.nombre_encargado,
                contacto_encargado: form.contacto_encargado,
                cui_encargado: form.cui_encargado,
                parentesco_encargado: form.parentesco_encargado,
                estado: 1, 
                estado_civil: form.estado_civil,
                profesion: form.profesion,
                nombre_padre: form.nombre_padre,
                nombre_madre: form.nombre_madre,
                lugar_nacimiento: form.lugar_nacimiento,
                estado_civil_encargado: form.estado_civil_encargado,
                profesion_encargado: form.profesion_encargado,
                direccion_encargado: form.direccion_encargado,
                nombre_conyuge: form.nombre_conyuge,
                direccion_conyuge: form.direccion_conyuge,
                telefono_conyuge: form.telefono_conyuge
            },
            { where: { 
                id: form.id 
            } }
        )
        .then(marca => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    activate (req, res) {
        Expediente.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(marca => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    changeState (req, res) {
        const dat = [
            'egreso por fallecimiento',
            'Hospitalización',
            'Egreso por alta médica',
            'Quirófano',
            'Cuidados Intensivos',
            'Emergencias',
            'Desahuciado'
        ]

        Logs.create({
            id_expediente: req.body.id,
            origen: dat[req.body.estado_anterior],
            destino: dat[req.body.estado]
        })

        Cuenta.findAll({
            where: { 
                id_expediente:req.body.id,
                pendiente_de_pago: { [Sequelize.Op.gt]: 0 }
        }})
            .then((cuentas)=>{
                if(cuentas.length > 0){
                    Expediente.update(
                        { solvencia: 0 },
                        { where: { 
                            id: req.body.id 
                        } }
                    )
                }else{
                    Expediente.update(
                        { solvencia: 1 },
                        { where: { 
                            id: req.body.id 
                        } }
                    )
            }}

            )

        if (typeof req.body.nombre_encargado === 'undefined'){
            Expediente.update(
                { estado: req.body.estado },
                { where: { 
                    id: req.body.id 
                } }
            )
            .then(marca => res.status(200).send('El registro ha sido modificado'))
            .catch(error => {
                console.log(error)
                return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
            });
        } else {
            Expediente.update(
                { 
                    estado: req.body.estado,
                    nombre_encargado: req.body.nombre_encargado,
                    cui_encargado: req.body.cui_encargado,
                    contacto_encargado: req.body.contacto_encargado,
                    parentesco_encargado: req.body.parentesco_encargado,
                 },
                { where: { 
                    id: req.body.id 
                } }
            )
            .then(marca => res.status(200).send('El registro ha sido modificado'))
            .catch(error => {
                console.log(error)
                return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
            });
        }
    },

    deactivate (req, res) {
        Expediente.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(marca =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    get (req, res) {
        Expediente.findAll({attributes: ['id', 'nombres']})
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    getSearch (req, res) {
        var busqueda = req.query.search;
        var condition = busqueda?{ [Op.or]:[ {nombres: { [Op.like]: `%${busqueda}%` }}],[Op.and]:[{estado:1}] } : {estado:1} ;
        Expediente.findAll({
            where: condition})
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    listQuirofano (req, res) {
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

        var condition = busqueda ? { [Op.or]: [{ nombres: { [Op.like]: `%${busqueda}%` }, estado: 3 }] } : {estado: 3} ;

        Expediente.findAndCountAll({ where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        console.log('data: '+JSON.stringify(data))
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems,last_page:response.totalPages, current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    listHospitalizacion (req, res) {
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

        var condition = busqueda ? { [Op.or]: [{ nombres: { [Op.like]: `%${busqueda}%` }, estado: 1 }] } : {estado: 1} ;

        Expediente.findAndCountAll({ where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        console.log('data: '+JSON.stringify(data))
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems,last_page:response.totalPages, current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    listIntensivo (req, res) {
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

        var condition = busqueda ? { [Op.or]: [{ nombres: { [Op.like]: `%${busqueda}%` }, estado: 4 }] } : {estado: 4} ;

        Expediente.findAndCountAll({ where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        console.log('data: '+JSON.stringify(data))
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems,last_page:response.totalPages, current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    listEmergencia (req, res) {
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

        var condition = busqueda ? { [Op.or]: [{ nombres: { [Op.like]: `%${busqueda}%` }, estado: 5 }] } : {estado: 5} ;


        Expediente.findAndCountAll({ where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        console.log('data: '+JSON.stringify(data))
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems,last_page:response.totalPages, current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    
    listReingreso (req, res) {
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

        var condition = busqueda ? { [Op.or]: [{ [criterio]: { [Op.like]: `%${busqueda}%` }, estado: 2 }] } : {estado: 2} ;

        Expediente.findAndCountAll({ where: condition, order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        console.log('data: '+JSON.stringify(data))
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems,last_page:response.totalPages, current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    changeStatus (req, res) {
        let form = req.body.form
        let status = 0
        if (form.selectedOption == 'hospi') {
            status = 1
        } else if (form.selectedOption == 'emergencia') {
            status = 5
        } else if (form.selectedOption == 'quirofano') {
            status = 3
        } else if (form.selectedOption == 'intensivo') {
            status = 4
        }
        Expediente.update(
            { estado: status },
            { where: { 
                id: form.id 
            }}
        )
        .then(marca => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
};

