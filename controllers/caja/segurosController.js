'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Expediente = db.expedientes;
const Cuenta = db.cuentas;
const Seguro = db.seguros;
const Aseguradora = db.aseguradoras;

module.exports = {
    
    create(req, res) {
        let form = req.body
        console.log("-----------------------",req.body)
        const datos = {
            id_expediente: form.id_expediente.id,
            id_aseguradora: form.id_aseguradora.id,
            no_poliza: form.no_poliza,
            nombre_asegurado: form.nombre_asegurado,
            tel_asegurado: form.tel_asegurado,
            correo_asegurado: form.correo_asegurado,
            solvente: '1',
        };

        Seguro.create(datos)
        .then(tipo => {
                res.send(tipo);
        })   
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
                    
    },

    list (req, res) {
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

        var condition = busqueda ? { [Op.or]: [{ no_poliza: { [Op.like]: `%${busqueda}%` } }] } : {} ;

        Seguro.findAndCountAll({ 
            include: [
                {
                    model: Expediente
                },
                {
                    
                    model: Aseguradora
                }
            ],
            where: condition,order:[[`${criterio}`,`${order}`]],limit,offset
        })
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
    
    assurancePayList (req, res) {
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

        const Op = Sequelize.Op;
        // "Seguros por cobrar" = seguros de pacientes marcados como de seguro (es_seguro=1)
        // que ya egresaron (por lo tanto están en etapa de cobro). Antes filtraba por
        // solvente=0; ahora el ruteo lo decide el flag es_seguro del expediente.
        const condition = busqueda ? { no_poliza: { [Op.like]: `%${busqueda}%` } } : {};

        Seguro.findAndCountAll({
            distinct: true,
            include: [
                {
                    model: Expediente,
                    required: true,
                    where: { es_seguro: 1, estado: { [Op.notIn]: [1, 3, 4, 5] } },
                    // Solo con saldo pendiente (cuenta activa); las pagadas ya no se cobran.
                    include: [{ model: Cuenta, required: true, where: { estado: 1 }, attributes: ['id'] }]
                },
                {
                    model: Aseguradora
                }
            ],
             where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
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

    deactivate (req, res) {
        console.log("HOLA")
        Seguro.update(
            { solvente: 2 },
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
    paid (req, res) {
        Seguro.update(
            { solvente: 1 },
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
    debt (req, res) {
        Seguro.update(
            { solvente: 0 },
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

    getAssuranceByExp (req, res) {
        
        console.log(req.query)
        Seguro.findAll({ where: {id_expediente: req.query.id_expediente}})
        .then(tipo => {
          console.log(tipo)
            res.status(200).send(tipo)
        })
            .catch(error => {
                console.log(error)
                res.status(400).send(error)
            })
    },

};
