'use strict';
const Sequelize = require('sequelize');
const db = require("../../models");
const Mantenimiento = db.mantenimientos;
const Equipo = db.equipos; 
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form;
        const datos = {
            fecha: form.fecha,
            costo: form.costo,
            siguiente: form.siguiente, 
            estado: 1,
            created_by: req.body.user, 
            id_equipo: form.id_equipo
        };

        Mantenimiento.create(datos)
            .then(mantenimiento => {
                res.status(201).send(mantenimiento);
            })
            .catch(error => {
                console.error("Error al crear mantenimiento:", error);
                return res.status(400).json({ msg: 'Ha ocurrido un error al crear el mantenimiento, por favor intente más tarde' });
            });
    },

    list(req, res) {
        const getPagingData = (data, page, limit) => {
            const { count: totalItems, rows: mantenimientos } = data;
            const currentPage = page ? +page : 0;
            const totalPages = Math.ceil(totalItems / limit);
            return { totalItems, mantenimientos, totalPages, currentPage };
        };

        const getPagination = (page, size) => {
            const limit = size ? +size : 10; 
            const offset = page ? page * limit : 0;
            return { limit, offset };
        };

        const busqueda = req.query.search;
        const page = req.query.page - 1;
        const size = req.query.limit;
        const criterio = req.query.criterio || 'fecha';
        const order = req.query.order || 'DESC';

        const { limit, offset } = getPagination(page, size);

        var condition = busqueda ? {
            [Op.or]: [
                { fecha: { [Op.like]: `%${busqueda}%` } },
                { costo: { [Op.like]: `%${busqueda}%` } }
            ]
        } : null;

        Mantenimiento.findAndCountAll({
            where: condition,
            order: [[`${criterio}`, `${order}`]],
            limit,
            offset,
            include: [
                {
                    model: Equipo,
                    as: 'equipo',
                    attributes: ['nombre']
                }
            ]
        })
            .then(data => {
                console.log('Datos de mantenimiento:', JSON.stringify(data));
                const response = getPagingData(data, page, limit);

                console.log('Respuesta paginada:', JSON.stringify(response));
                res.status(200).send({
                    total: response.totalItems,
                    last_page: response.totalPages,
                    current_page: page + 1,
                    from: offset + 1, 
                    to: offset + response.mantenimientos.length,
                    data: response.mantenimientos
                });
            })
            .catch(error => {
                console.error("Error al listar mantenimientos:", error);
                return res.status(400).json({ msg: 'Ha ocurrido un error al listar los mantenimientos, por favor intente más tarde' });
            });
    },

    find(req, res) {
        const id = req.params.id;

        Mantenimiento.findByPk(id, {
            include: [ // Incluye el modelo Equipo
                {
                    model: Equipo,
                    as: 'equipo',
                    attributes: ['nombre', 'cantidad_usos', 'precio_publico'] // Atributos del equipo a incluir
                }
            ]
        })
            .then(mantenimiento => {
                if (!mantenimiento) {
                    return res.status(404).send({ msg: "Mantenimiento no encontrado" });
                }
                res.status(200).send(mantenimiento);
            })
            .catch(error => {
                console.error("Error al encontrar mantenimiento:", error);
                res.status(400).send(error);
            });
    },

    update(req, res) {
        let form = req.body.form;
        Mantenimiento.update(
            {
                fecha: form.fecha,
                costo: form.costo,
                siguiente: form.siguiente,
                estado: form.estado, // Se puede actualizar el estado directamente
                updated_by: req.body.user,
                id_equipo: form.id_equipo // Se puede actualizar el equipo asociado
            },
            {
                where: {
                    id: form.id
                }
            }
        )
            .then(num => {
                if (num == 1) {
                    res.status(200).send('El registro de mantenimiento ha sido actualizado correctamente.');
                } else {
                    res.status(404).send('No se encontró el mantenimiento para actualizar o no hubo cambios.');
                }
            })
            .catch(error => {
                console.error("Error al actualizar mantenimiento:", error);
                return res.status(400).json({ msg: 'Ha ocurrido un error al actualizar el mantenimiento, por favor intente más tarde' });
            });
    },

    activate(req, res) {
        Mantenimiento.update(
            { estado: 1, updated_by: req.body.user },
            { where: { id: req.body.id } }
        )
            .then(num => {
                if (num == 1) {
                    res.status(200).send('El registro de mantenimiento ha sido activado.');
                } else {
                    res.status(404).send('No se encontró el mantenimiento para activar.');
                }
            })
            .catch(error => {
                console.error("Error al activar mantenimiento:", error);
                return res.status(400).json({ msg: 'Ha ocurrido un error al activar el mantenimiento, por favor intente más tarde' });
            });
    },

    deactivate(req, res) {
        Mantenimiento.update(
            { estado: 0, updated_by: req.body.user },
            { where: { id: req.body.id } }
        )
            .then(num => {
                if (num == 1) {
                    res.status(200).send('El registro de mantenimiento ha sido desactivado.');
                } else {
                    res.status(404).send('No se encontró el mantenimiento para desactivar.');
                }
            })
            .catch(error => {
                console.error("Error al desactivar mantenimiento:", error);
                return res.status(400).json({ msg: 'Ha ocurrido un error al desactivar el mantenimiento, por favor intente más tarde' });
            });
    },

    get(req, res) {
        Mantenimiento.findAll({
            attributes: ['id', 'fecha', 'costo', 'id_equipo'], // Atributos a incluir
            include: [ // Incluye el modelo Equipo para mostrar el nombre del equipo
                {
                    model: Equipo,
                    as: 'equipo',
                    attributes: ['nombre']
                }
            ]
        })
            .then(data => {
                res.status(200).send(data);
            })
            .catch(error => {
                console.error("Error al obtener mantenimientos:", error);
                return res.status(400).json({ msg: 'Ha ocurrido un error al obtener los mantenimientos, por favor intente más tarde' });
            });
    },

    getSearch(req, res) {
        var busqueda = req.query.search;
        // Condición de búsqueda: por 'fecha' o 'costo', y solo los activos (estado: 1)
        var condition = busqueda ? {
            [Op.and]: [
                { estado: 1 },
                {
                    [Op.or]: [
                        { fecha: { [Op.like]: `%${busqueda}%` } },
                        { costo: { [Op.like]: `%${busqueda}%` } }
                    ]
                }
            ]
        } : { estado: 1 };

        Mantenimiento.findAll({
            where: condition,
            include: [ // Incluye el modelo Equipo
                {
                    model: Equipo,
                    as: 'equipo',
                    attributes: ['nombre']
                }
            ]
        })
            .then(data => {
                res.status(200).send(data);
            })
            .catch(error => {
                console.error("Error al buscar mantenimientos:", error);
                return res.status(400).json({ msg: 'Ha ocurrido un error al buscar mantenimientos, por favor intente más tarde' });
            });
    }
};
