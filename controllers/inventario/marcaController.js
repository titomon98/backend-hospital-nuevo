'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Marca = db.marcas;
const Op = db.Sequelize.Op;
const CasaMedica = db.casa_medicas;

module.exports = {
    create(req, res) {
        let form = req.body.form
        console.log(form)
        const datos = {
            nombre: form.name,
            id_casa_medica: form.medicalHouse.id,
            estado: 1
        };

        Marca.create(datos)
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

        if(columna == '1'){
            var condition = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;
            var conditionHouse = null;
        } else if(columna == '2'){
            var condition = null
            var conditionHouse = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;
        }


        const { limit, offset } = getPagination(page, size);

        // var condition = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Marca.findAndCountAll({ 
            include: [
                {
                    model: CasaMedica,
                    require: true,
                    where: conditionHouse
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

        return Marca.findByPk(id)
        .then(Marca => res.status(200).send(Marca))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Marca.update(
            {
                nombre: form.name,
                id_casa_medica: form.medicalHouse.id,
            },
            { where: { 
                id: form.id 
            } }
        )
        .then(Marca => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => res.status(400).send(error))
    },

    activate (req, res) {
        Marca.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(Marca => res.status(200).send('El registro ha sido activado'))
        .catch(error => res.status(400).send(error))
    },

    deactivate (req, res) {
        Marca.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(Marca =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => res.status(400).send(error))
    },
    get (req, res) {
        Marca.findAll({
            include: [
                {
                    model: CasaMedica,
                    require: true,
                }
            ],
            attributes: ['id', 'nombre']})
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
    getSearch (req, res) {
        var busqueda = req.query.search;
        console.log(busqueda)
        var condition =busqueda?{ [Op.or]:[ {numero: { [Op.like]: `%${busqueda}%` }}],[Op.and]:[{estado:1}] } : {estado:1} ;
        Marca.findAll({
            include: [
                {
                    model: CasaMedica,
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

