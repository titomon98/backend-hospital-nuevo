'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Examenes = db.examenes_realizados;
const ExamenAlmacenado = db.examenes_almacenados;
const Encargado = db.encargados;
const Expediente = db.expedientes;
const Op = db.Sequelize.Op;
const moment = require('moment');

module.exports = {

    async create(req, res) {

        const restarHoras = (fecha, horas) => {
            let nuevaFecha = new Date(fecha); // Crear una nueva instancia de fecha
            nuevaFecha.setHours(nuevaFecha.getHours() - horas);
            return nuevaFecha;
          };

          console.log(req.body.form)
          let form = req.body.form

        const datos = {
            expediente: form.nombre,
            cui: form.cui,
            comision: form.comision,
            total: form.total,
            correo: form.correo,
            whatsapp: form.whatsapp,
            numero_muestra: form.numero_muestra,
            referido: form.referido,
            id_encargado: form.id_encargado.id,
            pagado: form.pagado,
            por_pagar: form.por_pagar,
            id_examenes_almacenados: form.id_examenes_almacenados.id,
            createdAt: restarHoras(new Date(), 6),
            updatedAt: restarHoras(new Date(), 6),
        };
        Examenes.create(datos)
        .then(tipo => {
            
            res.send(tipo);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });           
    },

    async getsearchExaAlmacenados(req, res) {
        const busqueda = req.query.search;
        const condition = busqueda ? { 
          nombre: { [Op.like]: `%${busqueda}%` }  // Cambio a Op.like y nombres (plural)
        } : null;
      
        try {
          const data = await ExamenAlmacenado.findAll({ where: condition });
          res.send(data);
        } catch (error) {
          console.error(error);
          res.status(500).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
      },
      
      async getsearchEncargado(req, res) {
        const busqueda = req.query.search;
        const condition = busqueda ? { 
          nombres: { [Op.like]: `%${busqueda}%` }  // Cambio a Op.like y nombres (plural)
        } : null;
      
        try {
          const data = await Encargado.findAll({ where: condition });
          res.send(data);
        } catch (error) {
          console.error(error);
          res.status(500).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
      },
      
      async getsearchExpediente(req, res) {
        const busqueda = req.query.search;
        const condition = busqueda ? { 
          nombre: { [Op.like]: `%${busqueda}%` }  // Cambio a Op.like y nombres (plural)
        } : null;
      
        try {
          const data = await Expediente.findAll({ where: condition });
          res.send(data);
        } catch (error) {
          console.error(error);
          res.status(500).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
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
            const data = await Examenes.findAndCountAll({
                include: [
                    { model: ExamenAlmacenado, attributes: ['nombre'] },
                    { model: Encargado, attributes: ['nombres'] }
                ],
                attributes: ['id','expediente','cui', 'comision','total','correo', 'whatsapp','numero_muestra','referido','pagado','por_pagar','createdAt'],
                order: [[Criterio, Order]], // Ordenamos por createdAt DESC
                limit,
                offset,
                where: whereClause 
            }); 
    
            const response = getPagingData(data, Page, limit);
    
            if (response.referido) {
                const dataResponse = response.referido.map(item => ({
                    id: item.id,
                    nombre : item.expediente,
                    cui : item.cui,
                    comision : item.comision,
                    total : item.total,
                    correo : item.correo,
                    whatsapp : item.whatsapp,
                    numero_muestra : item.numero_muestra,
                    referido : item.referido,
                    nombre_encargago: item.encargado.nombres,
                    pagado : item.pagado,
                    por_pagar : item.por_pagar,
                    nombre_examen: item.examenes_almacenado.nombre,
                    fecha_hora: item.createdAt,
                }));
                console.log(dataResponse)
    
                response.referido = dataResponse;
            } else {
                // Manejar el caso en que response.referido es undefined
                response.referido = []; // O enviar una respuesta adecuada al frontend
            }
            res.send({total:response.totalItems,last_page:response.totalPages, current_page: Page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    }
}