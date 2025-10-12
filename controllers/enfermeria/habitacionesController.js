'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Habitaciones = db.habitaciones;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form
        const datos = {
            nombre: form.nombre,
            created_by: req.body.user,
            estado: 1
        };

        Habitaciones.create(datos)
        .then(tipo => {
            res.send(tipo);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
                    
    },

 
    async list(req, res) {
        try {
            // ---- Helper functions ----
            const getPagination = (page, size) => {
            const limit = size ? +size : 10; // default 10 per page
            const offset = page ? (page - 1) * limit : 0;
            return { limit, offset };
            };
        
            const getPagingData = (data, page, limit) => {
            const { count: totalItems, rows: items } = data;
            const currentPage = page ? +page : 1;
            const totalPages = Math.ceil(totalItems / limit);
        
            return { totalItems, items, totalPages, currentPage };
            };
        
            // ---- Query params ----
            const busqueda = req.query.search || '';
            const page = parseInt(req.query.page) || 1;
            const size = parseInt(req.query.limit) || 10;
            const criterio = req.query.criterio || 'id';
            const order = req.query.order || 'ASC';
        
            const { limit, offset } = getPagination(page, size);
        
            // ---- Condition ----
            const condition = busqueda
            ? { [Op.or]: [{ tipo: { [Op.like]: `%${busqueda}%` } }] }
            : null;
        
            // ---- Query ----
            const data = await Habitaciones.findAndCountAll({
            where: condition,
            order: [[criterio, order]],
            limit,
            offset,
            });
        
            const response = getPagingData(data, page, limit);
        
            // ---- Final Response ----
            res.json({
            total: response.totalItems,
            per_page: limit,
            last_page: response.totalPages,
            current_page: response.currentPage,
            from: offset + 1,
            to: offset + response.items.length,
            data: response.items,
            });
        } catch (error) {
            console.error(error);
            res.status(400).json({
            msg: 'Ha ocurrido un error, por favor intente más tarde',
            error: error.message,
            });
        }
    },


    find (req, res) {
        const id = req.params.id;

        return Habitaciones.findByPk(id)
        .then(marca => res.status(200).send(marca))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Habitaciones.update(
            { 
                numero: form.numero,
                tipo: form.tipo,
                costo_ambulatorio: form.costo_ambulatorio,
                costo_diario: form.costo_diario,
                costo_estudio_de_sueno: form.costo_estudio_de_sueno,
                costo_quimioterapia: form.costo_quimioterapia,
                updated_by: req.body.user,
            },
            { 
                where: { 
                id: form.id 
            }}
        )
        .then(marca => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    activate (req, res) {
        Habitaciones.update(
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
        Habitaciones.update(
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
    
    inUse (req, res) {
        Habitaciones.update(
            { 
                estado: 2,
                ocupante: req.body.ocupante
            },
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

    available (req, res) {
        Habitaciones.update(
            { 
                estado: 1,
                ocupante: null
            },
            { where: { 
                ocupante: req.body.ocupante}
            }
        )
        .then(marca => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    getSearch (req, res) {
        var busqueda = req.query;
        console.log(busqueda)
        if (busqueda.tipo === '1') {
            Habitaciones.findAll({
                where: {
                    estado: 1,
                    tipo: 'Semi-privada'
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
        else {
            Habitaciones.findAll({
                where: {
                    estado: 1
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
        
    },

    get (req, res) {
        var busqueda = req.query.tipo
        if (busqueda === '1') {
            return Habitaciones.findAll({
                where: {
                    estado: 1,
                    tipo: 'Semi-privada'
                }
            })
            .then(tipo => {
                res.status(200).send(tipo);
            })
            .catch(error =>  {
                console.error('Error al obtener habitaciones:', error);
                res.status(402).send(error);
            })
        }
        return Habitaciones.findAll({
            where: {
                estado: 1
            }
        })
        .then(tipo => {
            res.status(200).send(tipo);
        })
        .catch(error =>  {
            console.error('Error al obtener habitaciones:', error);
            res.status(402).send(error);
        })
    },

    getAll (req, res) {
        var busqueda = req.query.tipo;
        if (busqueda === '1') {
            return Habitaciones.findAll()
            .then(tipo => res.status(200).send(tipo))
            .catch(error => res.status(400).send(error));
        }
        return Habitaciones.findAll()
        .then(tipo => res.status(200).send(tipo))
        .catch(error => res.status(400).send(error));
    },
};

