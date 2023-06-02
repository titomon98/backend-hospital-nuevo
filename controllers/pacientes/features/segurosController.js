'use strict'
const Sequelize     = require('sequelize');
const db = require("../../../models");
const Seguro = db.seguros;
const Paciente = db.pacientes;
const Usuario = db.usuarios;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form
        const datos = {         
            activo: form.active.value,
            prioridad: form.priority.value,
            seguro: form.insurance,
            fecha: form.date,
            valido_hasta: form.valid,
            estado: 1,
            id_paciente: form.patientId,
            id_usuario: form.userId,
        };
        
        Seguro.create(datos)
        .then(seguro => {
        res.send(seguro);
        }).catch(error => {
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
        const patientId = req.query.patientId;
        const columna = req.query.columna;

        const { limit, offset } = getPagination(page, size);

        var condition = busqueda ? { [Op.or]: [{ [columna]: { [Op.like]: `%${busqueda}%` } }], id_paciente: patientId } : null ;

        Seguro.findAndCountAll({ 
            include: [
            {
                model: Usuario,
                require: true,
            }
        ], where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        console.log('data: '+JSON.stringify(data))
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems,last_page:response.totalPages,current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    update (req, res) {
        let form = req.body.form
        Seguro.update(
            {
                activo: form.active.value,
                prioridad: form.priority.value,
                seguro: form.insurance,
                fecha: form.date,
                valido_hasta: form.valid,
                estado: 1,
                id_paciente: form.patientId,
                id_usuario: form.userId,
            },
            { where: { 
                id: form.id
            } }
        )
        .then(seguro => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => res.status(400).send(error))
    },

    activate (req, res) {
        let id = req.body.id
        Seguro.update(
            { estado: 1 },
            { where: { 
                id: id
            } }
        )
        .then(seguro => res.status(200).send('El registro ha sido activado'))
        .catch(error => res.status(400).send(error))
    },

    deactivate (req, res) {
        let id = req.body.id
        Seguro.update(
            { estado: 0 },
            { where: { 
                id: id
            } }
        )
        .then(seguro =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => res.status(400).send(error))
    },

    get (req, res) {
        const { id } = req.query;
        // Validación de backend
        if (!(id)) {
            return res.status(400).send("No llenó todos los campos");
        }
        Seguro.findAll({ 
            where: { 
                id_paciente: id 
            },
            include: [
                {
                    model: Paciente,
                    as: 'paciente',
                    require: true,
                },
                {
                    model: Usuario,
                    as: 'usuario',
                    require: true,
                }
            ]
        })
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
};

