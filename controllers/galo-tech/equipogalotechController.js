'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Equipo = db.equipo_galo_techs;
const Tipo = db.tipo_equipos;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form
        const datos = {
            nombre: form.name,
            codigo: form.code,
            existencia_total: 0,
            id_tipo_equipo: form.type.id,
            estado: 1
        };
        console.log(form)
        Equipo.create(datos)
        .then(marca => {
        res.send(marca);

        })
        .catch(err => {
            console.log(err)
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

        if(columna == 'Tipo'){
            var conditionType = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ; 
            var condition = null;
        } else {
            var condition = busqueda ? { [Op.or]: [{ [columna]: { [Op.like]: `%${busqueda}%` } }] } : null ; 
            var conditionType = null;
        }


        const { limit, offset } = getPagination(page, size);

        // var condition = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Equipo.findAndCountAll({ 
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
        res.send({total:response.totalItems,current_page: page+1,  last_page:response.totalPages,from:response.currentPage,to:response.totalPages,data:response.referido});
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

        return Equipo.findByPk(id)
        .then(equipo => res.status(200).send(equipo))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Equipo.update(
            { 
                nombre: form.name,
                codigo: form.code,
                id_tipo_equipo: form.type.id,   
            },
            { where: { 
                id: form.id 
            } }
        )
        .then(data => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => res.status(400).send(error))
    },

    activate (req, res) {
        Equipo.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(equipo => res.status(200).send('El registro ha sido activado'))
        .catch(error => res.status(400).send(error))
    },

    deactivate (req, res) {
        Equipo.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(equipo =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => res.status(400).send(error))
    },

    getSearch (req, res) {
        var busqueda = req.query.search;
        var condition = busqueda?{ [Op.or]:[ {nombre: { [Op.like]: `%${busqueda}%` }}],[Op.and]:[{estado:1}] } : {estado:1} ;
        Equipo.findAll({
            include: [
                { 
                    model: Tipo,
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
