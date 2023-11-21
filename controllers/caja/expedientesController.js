'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Expediente = db.expedientes;
const Cuenta = db.cuentas;
const Habitaciones = db.habitaciones;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form
        const today = new Date();
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
            estado: 1
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

            //Actualizar expediente
            const year = today.getFullYear();
            let resto
            if (expediente_id.toString().length === 1) {
                resto = '000' + expediente_id
            }
            else if (expediente_id.toString().length === 2) {
                resto = '00' + expediente_id
            }
            else if (expediente_id.toString().length === 3) {
                resto = '0' + expediente_id
            }
            else if (expediente_id.toString().length === 4) {
                resto = '' + expediente_id
            }
            resto = year + '-' + resto
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

        var condition = busqueda ? { [Op.or]: [{ contrato: { [Op.like]: `%${busqueda}%` } }] } : null ;

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
                estado: 1
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
        Expediente.findAll({attributes: ['id', 'contrato']})
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
        var condition = busqueda?{ [Op.or]:[ {contrato: { [Op.like]: `%${busqueda}%` }}],[Op.and]:[{estado:1}] } : {estado:1} ;
        Expediente.findAll({
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

