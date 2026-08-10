const Sequelize     = require('sequelize');
const db = require("../../models");
const Personal = db.personals;
const DetallePersonal = db.detalle_personals;
const Servicios = db.servicios;
const Op = db.Sequelize.Op;

module.exports = {
    async create(req, res) {
        try {
            const { descripcion, id_personal, id_servicio } = req.body;

            const nuevo = await DetallePersonal.create({
                descripcion,
                id_personal,
                id_servicio,
                estado: 1
            });

            return res.status(201).json({
                ok: true,
                data: nuevo
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                ok: false,
                message: "Error al crear detalle de personal"
            });
        }
    },

    // Guarda el personal de sala para un servicio de personal (id 9-14 del
    // catalogo `servicios`). Registro aislado: solo personal <-> servicio,
    // sin relacion con el consumo ni con la cuenta.
    async createForServicio(req, res) {
        try {
            const { id_servicio, personal, user } = req.body;

            if (!id_servicio || !Array.isArray(personal) || personal.length === 0) {
                return res.status(400).json({
                    ok: false,
                    message: "Datos incompletos: se requiere id_servicio y personal"
                });
            }

            const responsable = req.user?.user ?? user ?? null;
            const filas = personal.map(persona => ({
                descripcion: 'Persona involucrada con identificador ' + persona.id,
                id_personal: persona.id,
                id_servicio: id_servicio,
                created_by: responsable
            }));

            const creados = await DetallePersonal.bulkCreate(filas);

            return res.status(201).json({
                ok: true,
                data: creados
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                ok: false,
                message: "Error al guardar el personal del servicio"
            });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;

            const registro = await DetallePersonal.findByPk(id);

            if (!registro) {
                return res.status(404).json({
                    ok: false,
                    message: "Registro no encontrado"
                });
            }

            registro.estado = 0;
            registro.updated_by = req.user?.user ?? req.body.user ?? null;
            await registro.save();

            return res.json({
                ok: true,
                message: "Estado actualizado a 0",
                data: registro
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                ok: false,
                message: "Error al actualizar"
            });
        }
    },

    async list(req, res) {
        try {
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 10;
            let offset = (page - 1) * limit;
    
            const { count, rows } = await DetallePersonal.findAndCountAll({
                include: [
                    {
                        model: Personal,
                        attributes: ["id", "nombre", "telefono", "categoria"]
                    },
                    {
                        model: Servicios,
                        attributes: ["id", "descripcion"]
                    }
                ],
                limit,
                offset,
                order: [["id", "DESC"]]
            });
    
            return res.json({
                ok: true,
                data: rows,
                total: count,
                page,
                lastPage: Math.ceil(count / limit)
            });
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                ok: false,
                message: "Error al obtener lista paginada"
            });
        }
    },

    async get(req, res) {
        try {
            const { id } = req.query; // aquí id es el id_personal
    
            const detalles = await DetallePersonal.findAll({
                where: { id_personal: id },
                include: [
                    { model: Personal, attributes: ["id", "nombre", "telefono"] },
                    { model: Servicios, attributes: ["id", "descripcion"] }
                ],
                order: [["id", "DESC"]]
            });
    
            if (!detalles || detalles.length === 0) {
                return res.status(404).json({
                    ok: false,
                    message: "No hay detalles asociados a este personal"
                });
            }
    
            return res.json({
                ok: true,
                data: detalles
            });
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                ok: false,
                message: "Error al obtener detalles del personal"
            });
        }
    },

    async getAll(req, res) {
        try {
            const data = await Personal.findAll({
                attributes: ["id", "nombre", "categoria"],
                order: [["nombre", "ASC"]]
            });
    
            return res.json({
                ok: true,
                data
            });
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                ok: false,
                message: "Error al obtener personal"
            });
        }
    }
};
