'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const DetalleCuentas = db.lab_detalle_cuentas;
const Cuenta = db.lab_cuentas;
const Expediente = db.expedientes;
const Op = db.Sequelize.Op;
const ExamenesRealizados = db.examenes_realizados;

module.exports = {
    create(req, res) {
        let form = req.body
        const datos = {
            nombre: form.nombre,
            valor_minimo: form.valor_minimo,
            valor_maximo: form.valor_maximo,
            unidades: form.unidades,
            id_examenes_almacenados: form.id_examenes_almacenados
        };

        DetalleCuentas.create(datos)
        .then(tipo => {
            res.send(tipo);
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

        var condition = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;

        DetalleCuentas.findAndCountAll({ where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
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

    listCortesPerDate(req, res) {
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

        console.log("DATE-----------------------------------", req.query.fecha_corte.split(' ')[0])
        var condition = { 
            [Op.and]: [
                { estado: { [Op.like]: 0 } },
                Sequelize.where(Sequelize.fn('DATE', Sequelize.col('fecha_corte')), req.query.fecha_corte.split(' ')[0]),
            ]
        };


        Cuenta.findAndCountAll({ 
            include: [
                {
                    model: ExamenesRealizados,  
                },
                {
                    model: Expediente,
                }
            ],
            where: condition})
        .then(data => {
            console.log('------------ data: '+JSON.stringify(data.rows))
            res.send(data.rows);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    find (req, res) {
        const id = req.params.id;

        return Contrato.findByPk(id)
        .then(marca => res.status(200).send(marca))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        console.log('Hola')
        let form = req.body
        DetalleCuentas.update(
            { 
                nombre: form.nombre,
                valor_minimo: form.valor_minimo,
                valor_maximo: form.valor_maximo,
                unidades: form.unidades,
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
        Contrato.update(
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
        Contrato.update(
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
    getByAccount (req, res) {
        DetalleCuentas.findAll({
            where:{
                id_lab_cuenta: req.query.id_lab_cuenta
            }
        })
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    }
};

