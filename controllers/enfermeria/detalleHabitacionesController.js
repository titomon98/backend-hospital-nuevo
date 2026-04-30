'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const DetalleHabitaciones = db.detalle_habitaciones;
const Cuenta = db.cuentas
const Expediente = db.expedientes
const Op = db.Sequelize.Op;
const moment = require('moment');

module.exports = {
    async list(req, res) {
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
        
        const { page = 1, size = 20, criterio = 'createdAt', order = 'DESC' , fechaDesde, fechaHasta} = req.query;
        const Page=req.query.page-1;
        const Size=req.query.limit;
        const Criterio = req.query.criterio;
        const Order = req.query.order;
        const FechaDesde = req.query.fechaDesde;
        const FechaHasta = req.query.fechaHasta; 
        const { limit, offset } = getPagination(Page, Size);
    
        try {
            const whereClause = {};
    
            if (FechaDesde && FechaHasta) {
                whereClause.createdAt = {
                    [Op.between]: [
                        moment(FechaDesde).startOf('day').toDate(), 
                        moment(FechaHasta).endOf('day').toDate()
                    ]
                };
            }
            const data = await DetalleHabitaciones.findAndCountAll({
                include: [
                    { 
                      model: Cuenta, 
                      attributes: ['numero'],
                      include: [
                        {
                          model: Expediente, 
                          attributes: ['nombres', 'apellidos']
                        }
                      ] 
                    }
                ],
                attributes: ['id', 'tipo_habitacion', 'ingreso', 'costo_base', 'createdAt', 'created_by', 'updated_by', 'estado'],
                order: [[Criterio, Order]], // Ordenamos por createdAt DESC
                limit,
                offset,
                where: whereClause 
            }); 
            const response = getPagingData(data, Page, limit);
            if (response.referido) {
                const dataResponse = response.referido.map(item => ({
                    id: item.id,
                    numero_cuenta: item.cuenta.numero,
                    costo_base: item.costo_base,
                    ingreso: item.ingreso,
                    tipo_habitacion: item.tipo_habitacion,
                    nombre_completo: item.cuenta.expediente.nombres + ' ' + item.cuenta.expediente.apellidos,
                    created_by: item.created_by,
                    updated_by: item.updated_by,
                    estado: item.estado
                }));
    
                response.referido = dataResponse;
            } else {
                // Manejar el caso en que response.referido es undefined
                response.referido = []; // O enviar una respuesta adecuada al frontend
            }
            console.log(response.referido)
            res.send({total:response.totalItems,last_page:response.totalPages, current_page: Page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
      },
    
      async deactivate(req, res) {
        const id_honorario = req.body.delete.id
        const responsable = req.body.delete.responsable
    
        const honorario = await DetalleHabitaciones.findByPk(id_honorario);
        honorario.estado = 0
        honorario.updated_by = responsable
        await honorario.save();

        //Tomar habitación para liberarla
        
        return res.send('Cobro de habitación eliminado correctamente')
      } 
};

