'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Paciente = db.pacientes;
const Record = db.records;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form 
        const datos = {
            nombre: form.name,
            apellidos: form.secondName,
            edad: form.age,
            nacimiento: form.born,
            telefono: form.phoneNumber,
            referente: form.referrer,
            procedencia: form.origin,
            cui: form.cui,
            estado: 1,
            estado_express: 1
        };
        
        Paciente.create(datos)
        .then(paciente => {
            const motivosConsulta = {
                contenido: 'Historial inicial de paciente',
                id_paciente: paciente.id,
                id_usuario: 1, //Aqui cambiarlo por el usuario actual
                estado: 1,
            }
            Record.create(motivosConsulta)
            Paciente.update({
                num_expediente: paciente.id,
            },
            { 
                where: { 
                id: paciente.id
            }})
            .then(paciente => res.status(200).send('El expediente ha sido asignado'))
            .catch(error => {
                console.log(error)
                return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
            });
            res.send(paciente);

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

        const { limit, offset } = getPagination(page, size);

        var condition = busqueda ? { [Op.or]: [{[columna]: { [Op.like]: `%${busqueda}%` } }], estado_express: 1 } : null ;

        Paciente.findAndCountAll(
        {
            where: condition, order:[[`${criterio}`,`${order}`]],limit,offset
        })
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
        const { id } = req;
        console.log(req)
        // Validación de backend
        if (!(_id)) {
            res.status(400).send("No llenó todos los campos");
        }

        return Paciente.findByPk(id)
        .then(paciente => res.status(200).send(paciente))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Paciente.update(
            { 
                nombre: form.name,
                apellidos: form.secondName,
                edad: form.age,
                nacimiento: form.born,
                telefono: form.phoneNumber,
                referente: form.referrer,
                procedencia: form.origin,
                cui: form.cui,
                estado: 1,
                estado_express: 1
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

    transform (req, res) {
        let form = req.body.form
        Paciente.update(
            { 
                nombre: form.name,
                apellidos: form.secondName,
                apellido_casada: form.marriedName,
                sexo: form.sex,
                estado_civil: form.maritalStatus,
                telefono: form.phoneNumber,
                correo: form.email,
                num_expediente: form.fileNumber,
                referente: form.referente,
                procedencia: form.procedencia,
                cui: form.cui,
                estado: 1,
                id_idioma: form.language.id,
                id_nacionalidad:form.nationality.id,
                id_tipo_sangre: form.blood.id,
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

    get (req, res) {
        const { id } = req.query;
        // Validación de backend
        if (!id) {
            return res.status(400).send("No llenó todos los campos");
        }
        Paciente.findByPk(id)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    }
};

