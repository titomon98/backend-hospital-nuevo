'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Usuario = db.usuarios;
const Tipo = db.tipo_usuarios;
const Op = db.Sequelize.Op;
const bcrypt = require('bcryptjs')

module.exports = {
    create(req, res) {
        let form = req.body.form
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(form.password, salt);
        const datos = {
            user: form.user,
            password: hash,
            estado: 1,
            id_tipo_usuario: form.userType.id
        };

        Usuario.create(datos)
        .then(usuario => {
        res.send(usuario);

        })
        .catch(err => {
        res.status(500).send({
            message:
            err.message || "Ocurrió un error"
        });
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

        if(columna == '1'){
            var condition = busqueda ? { [Op.or]: [{ user: { [Op.like]: `%${busqueda}%` } }] } : null ;
            var conditionType = null;
        } else if(columna == '2'){
            var condition = null
            var conditionType = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;
        }


        const { limit, offset } = getPagination(page, size);

        // var condition = busqueda ? { [Op.or]: [{ user: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Usuario.findAndCountAll({
            include: [
                {
                    model: Tipo,
                    require: true,
                    where: conditionType
                }
            ],
            where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
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


    find (req, res) {
        const id = req.params.id;

        return Usuario.findByPk(id)
        .then(usuario => res.status(200).send(usuario))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(form.password, salt);
        Usuario.update(
            { 
                user: form.user,
                password: hash,
                id_tipo_usuario: form.userType.id
            },
            { where: { 
                id: form.id 
            } }
        )
        .then(usuario => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => res.status(400).send(error))
    },

    activate (req, res) {
        Usuario.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(usuario => res.status(200).send('El registro ha sido activado'))
        .catch(error => res.status(400).send(error))
    },

    deactivate (req, res) {
        Usuario.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(usuario =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => res.status(400).send(error))
    },
    
    get (req, res) {
        Usuario.findAll({attributes: ['id', 'nombre']})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
            message:
            err.message || "Ha ocurrido un error."
            });
        });
    },

    get_tipo_usuario(req, res) {
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
        const order=req.query.order;


        const { limit, offset } = getPagination(page, size);

        var condition = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Tipo_usuario.findAndCountAll({ where: condition,limit,offset})
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

    getSearch (req, res) {
        Usuario.findAll({attributes: ['id', 'nombre']})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
            message:
            err.message || "Ha ocurrido un error."
            });
        });
    },

};

