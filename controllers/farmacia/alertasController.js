'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Medicamento = db.medicamentos;
const Marca = db.marcas;
const Presentacion = db.presentaciones;
const Proveedor = db.proveedores;
const Comun = db.comunes;
const Quirurgico = db.quirurgicos;

const Op = db.Sequelize.Op;

module.exports = {

    listMedicamentos(req, res) {
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

        var condition = busqueda ? { 
            [Op.and]: [{ 
                nombre: { [Op.like]: `%${busqueda}%`},
                [Op.or]: [{ 
                    existencia_actual: {
                        [Op.lt]: 6
                    },
                },
                { 
                    existencia_actual_quirofano: {
                        [Op.lt]: 6
                    }
                },
                {
                    existencia_actual_farmacia: {
                        [Op.lt]: 6
                    }
                }]
            }] 
        } : {
            [Op.or]: [{ 
                existencia_actual: {
                    [Op.lt]: 6
                },
            },
            { 
                existencia_actual_quirofano: {
                    [Op.lt]: 6
                }
            },
            {
                existencia_actual_farmacia: {
                    [Op.lt]: 6
                }
            }] 
        } ;

        Medicamento.findAndCountAll({ 
            include: [
                {
                    model: Marca,
                },
                {
                    model: Presentacion
                },
                {
                    model: Proveedor
                },
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

    listComunes(req, res) {
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

        var condition = busqueda ? { 
            [Op.and]: [{ 
                nombre: { [Op.like]: `%${busqueda}%`},
                [Op.or]: [{ 
                    existencia_actual: {
                        [Op.lt]: 6
                    },
                },
                { 
                    existencia_actual_quirofano: {
                        [Op.lt]: 6
                    }
                },
                {
                    existencia_actual_farmacia: {
                        [Op.lt]: 6
                    }
                }]
            }] 
        } : {
            [Op.or]: [{ 
                existencia_actual: {
                    [Op.lt]: 6
                },
            },
            { 
                existencia_actual_quirofano: {
                    [Op.lt]: 6
                }
            },
            {
                existencia_actual_farmacia: {
                    [Op.lt]: 6
                }
            }] 
        } ;

        Comun.findAndCountAll({ 
            include: [
                {
                    model: Marca,
                },
                {
                    model: Presentacion
                },
                {
                    model: Proveedor
                },
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

    listQuirurgico(req, res) {
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

        var condition = busqueda ? { 
            [Op.and]: [{ 
                nombre: { [Op.like]: `%${busqueda}%`},
                [Op.or]: [{ 
                    existencia_actual: {
                        [Op.lt]: 6
                    },
                },
                { 
                    existencia_actual_quirofano: {
                        [Op.lt]: 6
                    }
                },
                {
                    existencia_actual_farmacia: {
                        [Op.lt]: 6
                    }
                }]
            }] 
        } : {
            [Op.or]: [{ 
                existencia_actual: {
                    [Op.lt]: 6
                },
            },
            { 
                existencia_actual_quirofano: {
                    [Op.lt]: 6
                }
            },
            {
                existencia_actual_farmacia: {
                    [Op.lt]: 6
                }
            }] 
        } ;

        Quirurgico.findAndCountAll({ 
            include: [
                {
                    model: Marca,
                },
                {
                    model: Presentacion
                },
                {
                    model: Proveedor
                },
            ],where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
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
};

