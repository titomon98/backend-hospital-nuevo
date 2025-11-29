const Sequelize     = require('sequelize');
const db = require("../../models");
const Personal = db.personals;
const DetallePersonal = db.detalle_personals;
const SalaOperaciones = db.servicio_sala_operaciones;
const Cuenta = db.cuentas;
const Expediente = db.expedientes;
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
                        model: SalaOperaciones,
                        attributes: ["id", "descripcion"],
                        include: [
                            {
                                model: Cuenta,
                                attributes: ["id", "numero"],
                                include: [
                                    {
                                        model: Expediente
                                    }
                                ],
                            }
                        ],
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
                    {
                        model: SalaOperaciones,
                        attributes: ["id", "descripcion"],
                        include: [
                            {
                                model: Cuenta,
                                attributes: ["id", "numero"],
                                include: [
                                    {
                                        model: Expediente,
                                        attributes: ["id", "nombres", "apellidos"],
                                    }
                                ],
                            }
                        ],
                    }
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
