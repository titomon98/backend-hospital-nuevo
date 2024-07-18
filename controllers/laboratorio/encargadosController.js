'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Encargado = db.encargados;
const Tipos = db.tipos_encargados;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form;
        Encargado.findAll({
            where: {
                usuario: form.usuario
            }
        }).then((result) => {
            if (result.length > 0) {
                res.send('Usuario existente');
            } else {
                const datos = {
                    contacto: form.contacto,
                    nombres: form.nombres,
                    apellidos: form.apellidos,
                    id_tipo_encargado: form.id_tipo_encargado,
                    usuario: form.usuario,
                    estado: 1
                };

                Encargado.create(datos)
                    .then(encargado => {
                        res.send(encargado);
                    })
                    .catch(error => {
                        console.log(error);
                        return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
                    });
            }
        }).catch(error => {
            console.log(error);
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

        var condition = busqueda ? { [Op.or]: [{ usuario: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Encargado.findAndCountAll({ include: [
                {
                    model: Tipos
                }
            ], where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
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

        return Encargado.findByPk(id)
        .then(encargado => res.status(200).send(encargado))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        Encargado.findAll((enc) => enc.usuario === form.usuario && enc.id != form.id).then((result)=>{
            if(result.lenght > 0){
                result.send('Usuario existente')
            }
            else{
                let form = req.body.form
                Encargado.update(
                    { 
                        contacto: form.contacto,
                        nombre: form.nombre,
                        apellidos: form.apellidos,
                        id_tipo_encargado: form.id_tipo_encargado,
                        usuario: form.usuario
                    },
                    { where: { 
                        id: form.id 
                    } }
                )
                .then(encargado => res.status(200).send('El registro ha sido actualizado'))
                .catch(error => {
                    console.log(error)
                    return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
                });
            }
        })
    },

    activate (req, res) {
        Encargado.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(encargado => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    deactivate (req, res) {
        Encargado.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(encargado =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    get (req, res) {
        Encargado.findAll({attributes: ['id', 'nombres', 'apellidos', 'contacto', 'id_tipo_encargado', 'estado', 'usuario'],
                include: {
                    model: Tipos
                }})
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
        var condition = busqueda?{ [Op.or]:[ {usuario: { [Op.like]: `%${busqueda}%` }}],[Op.and]:[{estado:1}] } : {estado:1} ;
        Encargado.findAll({
            where: condition,
                include: {
                    model: Tipos
                }})
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    }
};

