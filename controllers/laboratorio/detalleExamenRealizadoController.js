'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Examenes = db.detalle_examen_realizado;
const TipoExamen = db.campo_examenes;
const UpdateExamenRealizado = db.examenes_realizados;
const Op = db.Sequelize.Op;
const moment = require('moment');

module.exports = {

    async create(req, res) {

        const restarHoras = (fecha, horas) => {
            let nuevaFecha = new Date(fecha);
            nuevaFecha.setHours(nuevaFecha.getHours() - horas);
            return nuevaFecha;
          };
          console.log(req.body.form)
          let form = req.body.form

          const examenSeleccionado = await UpdateExamenRealizado.findOne({ 
            where: { id: form.id } 
          });
          if (!examenSeleccionado) {
            return res.status(404).json({ msg: 'No se encontró el examen a actualizar' });
          }
        console.log(examenSeleccionado)
        const datos = {
            id_examen_realizado: form.id,
            tipo: form.tipo.nombre,
            resultados: form.resultado,
            createdAt: restarHoras(new Date(), 6),
            updatedAt: restarHoras(new Date(), 6),
        };
        Examenes.create(datos)
        await examenSeleccionado.update({estado: 2})
        .then(tipo => {
            res.send(tipo);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });           
    },

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
        
        const { page = 1, size = 5, criterio = 'createdAt', order = 'DESC' , fechaDesde, fechaHasta} = req.query;
        const Page=req.query.page-1;
        const Size=req.query.limit;
        const Criterio = req.query.criterio;
        const Order = req.query.order;
        const { limit, offset } = getPagination(Page, Size);
    
        try {
            const data = await Examenes.findAndCountAll({
                attributes: ['resultados','tipo','createdAt'],
                where: {id_examen_realizado: req.query.id },
                order: [[Criterio, Order]],
                limit,
                offset,
            }); 
    
            const response = getPagingData(data, Page, limit);
    
            if (response.referido) {
                const dataResponse = response.referido.map(item => ({
                    resultados: item.resultados,
                    tipo: item.tipo,
                    fecha_hora: item.createdAt
                }));
                console.log(dataResponse)
    
                response.referido = dataResponse;
            } else {
                response.referido = []
            }
            res.send({
                total:response.totalItems,
                ast_page:response.totalPages, 
                current_page: Page+1, 
                from:response.currentPage,
                to:response.totalPages,
                data:response.referido
            });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },
    
    async getsearchTipo(req, res) {
        const busqueda = req.query.search;
        const condition = busqueda ? { 
          nombre: { [Op.like]: `%${busqueda}%` } 
        } : null;
      
        try {
          const data = await TipoExamen.findAll({ where: condition });
          res.send(data);
        } catch (error) {
          console.error(error);
          res.status(500).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
      },
}