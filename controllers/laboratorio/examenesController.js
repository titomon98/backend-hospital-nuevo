'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Examenes = db.examenes_realizados;
const ExamenAlmacenado = db.examenes_almacenados;
const Encargado = db.encargados;
const Expediente = db.expedientes;
const Cuenta = db.lab_cuentas;
const Op = db.Sequelize.Op;
const moment = require('moment');

module.exports = {

    async create(req, res) {
      /* ESTADOS DE EXAMEN
      En progreso = 1
      Pagado = 2
      Con resultados = 3
      Anulado = 4
      */
      
      const restarHoras = (fecha, horas) => {
        let nuevaFecha = new Date(fecha);
        nuevaFecha.setHours(nuevaFecha.getHours() - horas);
        return nuevaFecha;
      };
    
      const today = new Date();
      let form = req.body.form;

      try {
        if (form.examenExterior == false) {
          try {
            if (form.NewExpediente == false) {
              const examenesAlmacenados = await ExamenAlmacenado.findAll({
                where: { id: form.id_examenes_almacenados },
              });
        
              const datosCuenta = {
                numero: 1,
                total: form.total,
                estado: 1,
                total_pagado: 0,
                pendiente_de_pago: form.total,
                id_expediente: form.id_expediente,
                createdAt: restarHoras(new Date(), 6),
                updatedAt: restarHoras(new Date(), 6),
                fecha_corte: null
              };
        
              const cuentaCreada = await Cuenta.create(datosCuenta);
              await cuentaCreada.update({ numero: cuentaCreada.id });
              
              // Crear un examen realizado por cada examen almacenado
              const examenesCreados = await Promise.all(
                examenesAlmacenados.map(async (examenAlmacenado) => {
                  const datosExamen = {
                    expediente: form.nombre,
                    cui: parseInt(form.cui),
                    comision: form.comision,
                    total: examenAlmacenado.precio_normal,
                    correo: form.correo,
                    whatsapp: form.whatsapp,
                    numero_muestra: form.numero_muestra,
                    referido: form.referido,
                    id_encargado: form.id_encargado?.id || null,
                    pagado: 0,
                    por_pagar: examenAlmacenado.precio_normal,
                    id_examenes_almacenados: examenAlmacenado.id,
                    estado: 1,
                    id_cuenta: cuentaCreada.id,
                    createdAt: restarHoras(new Date(), 6),
                    updatedAt: restarHoras(new Date(), 6),
                  };
                  return Examenes.create(datosExamen);
                })
              );
        
              res.send(cuentaCreada);
            } else if (form.NewExpediente == true) {
              const examenesAlmacenados = await ExamenAlmacenado.findAll({
                where: { id: form.id_examenes_almacenados },
              });
        
              const datos_expediente = {
                nombres: form.nombre,
                apellidos: form.apellido,
                expediente: 'INGRESO EN LABORATORIO',
                primer_ingreso: restarHoras(new Date(), 6),
                fecha_ingreso_reciente: restarHoras(new Date(), 6),
                hora_ingreso_reciente: restarHoras(new Date(), 6),
                nacimiento: '0001-01-01',
                cui: form.cui,
                telefono: form.whatsapp,
                direccion: 'INGRESO EN LABORATORIO',
                nombre_encargado: 'INGRESO EN LABORATORIO',
                contacto_encargado: 'INGRESO EN LABORATORIO',
                cui_encargado: 'INGRESO EN LABORATORIO',
                direccion_encargado: 'INGRESO EN LABORATORIO',
                estado: 11
              };
        
              const expediente = await Expediente.create(datos_expediente);
              const year = today.getFullYear();
              var idFormateado = String(expediente.id).padStart(4, "0");
              const nuevoExpediente = year + "-" + idFormateado;
              await expediente.update({ expediente: nuevoExpediente });
        
              const datosCuenta = {
                numero: 1,
                total: form.total,
                estado: 1,
                total_pagado: 0,
                pendiente_de_pago: form.total,
                id_expediente: expediente.id,
                createdAt: restarHoras(new Date(), 6),
                updatedAt: restarHoras(new Date(), 6),
                fecha_corte: null,
              };
        
              const cuentaCreada = await Cuenta.create(datosCuenta);
              await cuentaCreada.update({ numero: cuentaCreada.id });
        
              // Crear un examen realizado por cada examen almacenado
              const examenesCreados = await Promise.all(
                examenesAlmacenados.map(async (examenAlmacenado) => {
                  const datosExamen = {
                    expediente: form.nombre + ' ' + form.apellido,
                    cui: form.cui,
                    comision: form.comision,
                    total: examenAlmacenado.precio_normal,
                    correo: form.correo,
                    whatsapp: form.whatsapp,
                    numero_muestra: form.numero_muestra,
                    referido: form.referido,
                    id_encargado: form.id_encargado?.id || null,
                    pagado: 0,
                    por_pagar: examenAlmacenado.precio_normal,
                    id_examenes_almacenados: examenAlmacenado.id,
                    estado: 1,
                    id_cuenta: cuentaCreada.id,
                    createdAt: restarHoras(new Date(), 6),
                    updatedAt: restarHoras(new Date(), 6),
                  };
                  return Examenes.create(datosExamen);
                })
              );
        
              res.send(cuentaCreada);
            }
          } catch (error) {
            console.error('Error al crear el examen:', error)
            res.status(501).send({ error: 'Error al crear el examen:' })
          }           
        } else if (form.examenExterior == true) {
          try {
            if (form.NewExpediente == false) {
              const examenesAlmacenados = await ExamenAlmacenado.findAll({
                where: { id: form.id_examenes_almacenados },
              });
              
              // Crear un examen realizado por cada examen almacenado
              const examenesCreados = await Promise.all(
                examenesAlmacenados.map(async (examenAlmacenado) => {
                  const datosExamen = {
                    expediente: form.nombre,
                    cui: parseInt(form.cui),
                    comision: form.comision,
                    total:0,
                    correo: form.correo,
                    whatsapp: form.whatsapp,
                    numero_muestra: form.numero_muestra,
                    referido: form.referido,
                    id_encargado: form.id_encargado?.id || null,
                    pagado: 0,
                    por_pagar: 0,
                    id_examenes_almacenados: examenAlmacenado.id,
                    estado: 2,
                    id_cuenta: 0,
                    createdAt: restarHoras(new Date(), 6),
                    updatedAt: restarHoras(new Date(), 6),
                  };
                  return Examenes.create(datosExamen);
                })
              );
              res.send(examenesCreados);
            } else if (form.NewExpediente == true) {
              const examenesAlmacenados = await ExamenAlmacenado.findAll({
                where: { id: form.id_examenes_almacenados },
              });
        
              const datos_expediente = {
                nombres: form.nombre,
                apellidos: form.apellido,
                expediente: 'INGRESO EN LABORATORIO',
                primer_ingreso: restarHoras(new Date(), 6),
                fecha_ingreso_reciente: restarHoras(new Date(), 6),
                hora_ingreso_reciente: restarHoras(new Date(), 6),
                nacimiento: '0001-01-01',
                cui: form.cui,
                telefono: form.whatsapp,
                direccion: 'INGRESO EN LABORATORIO',
                nombre_encargado: 'INGRESO EN LABORATORIO',
                contacto_encargado: 'INGRESO EN LABORATORIO',
                cui_encargado: 'INGRESO EN LABORATORIO',
                direccion_encargado: 'INGRESO EN LABORATORIO',
                estado: 11
              };
        
              const expediente = await Expediente.create(datos_expediente);
              const year = today.getFullYear();
              var idFormateado = String(expediente.id).padStart(4, "0");
              const nuevoExpediente = year + "-" + idFormateado;
              await expediente.update({ expediente: nuevoExpediente });

              // Crear un examen realizado por cada examen almacenado
              const examenesCreados = await Promise.all(
                examenesAlmacenados.map(async (examenAlmacenado) => {
                  const datosExamen = {
                    expediente: form.nombre + ' ' + form.apellido,
                    cui: form.cui,
                    comision: form.comision,
                    total: 0,
                    correo: form.correo,
                    whatsapp: form.whatsapp,
                    numero_muestra: form.numero_muestra,
                    referido: form.referido,
                    id_encargado: form.id_encargado?.id || null,
                    pagado: 0,
                    por_pagar: 0,
                    id_examenes_almacenados: examenAlmacenado.id,
                    estado: 2,
                    id_cuenta: 0,
                    createdAt: restarHoras(new Date(), 6),
                    updatedAt: restarHoras(new Date(), 6),
                  };
                  return Examenes.create(datosExamen);
                })
              );
        
              res.send(examenesCreados);
            }
          } catch (error) {
            console.error('Error al crear el examen:', error)
            res.status(501).send({ error: 'Error al crear el examen:' })
          }  
        }
      } catch (error) {
        console.error('Error al validar si es examen externo o interno:', error);
        res.status(500).send({ error: 'Error al validar si es examen externo o interno:' });
      }
      

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

    async getsearchExaAlmacenadosBuscar(req, res) {
      const busqueda = req.query.search;
      const page = parseInt(req.query.page) || 1; 
      const limit = parseInt(req.query.limit) || 10;
    
      const condition = busqueda ? { 
        nombre: { [Op.like]: `%${busqueda}%` } 
      } : null;
    
      try {
        const { count, rows: data } = await ExamenAlmacenado.findAndCountAll({ 
          where: condition,
          limit: limit,
          offset: (page - 1) * limit 
        });
    
        res.json({
          data: data,
          currentPage: page,
          total: count,
          perPage: limit
        }); 
      } catch (error) {
        console.error(error);
        res.status(500).json({ 
          msg: 'Ha ocurrido un error, por favor intente más tarde',
          error: error.message 
        });
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
            const whereClause = {
              estado: { [Op.in]: [1] }
            };

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
                attributes: [
                  'id',
                  'expediente',
                  'cui', 
                  'comision',
                  'total',
                  'correo', 
                  'whatsapp',
                  'numero_muestra',
                  'referido',
                  'pagado',
                  'por_pagar',
                  'id_examenes_almacenados',
                  'createdAt'],
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
                    nombre_encargago: item.encargado?.nombres || 'Sin Encargado',
                    pagado : item.pagado,
                    por_pagar : item.por_pagar,
                    id_examenes_almacenados : item.id_examenes_almacenados,
                    nombre_examen: item.examenes_almacenado.nombre,
                    fecha_hora: item.createdAt,
                }));
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
    },

    async list2(req, res) {
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
          const whereClause = {
            estado: { [Op.in]: [2] }
          };

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
              attributes: [
                'id',
                'expediente',
                'cui', 
                'comision',
                'total',
                'correo', 
                'whatsapp',
                'numero_muestra',
                'referido',
                'pagado',
                'por_pagar',
                'id_examenes_almacenados',
                'createdAt'],
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
                  nombre_encargago: item.encargado?.nombres || 'Sin Encargado',
                  pagado : item.pagado,
                  por_pagar : item.por_pagar,
                  id_examenes_almacenados : item.id_examenes_almacenados,
                  nombre_examen: item.examenes_almacenado.nombre,
                  fecha_hora: item.createdAt,
              }));
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
    },
    
    async list3(req, res) {
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
          const whereClause = {
            estado: { [Op.in]: [3] }
          };

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
              attributes: [
                'id',
                'expediente',
                'cui', 
                'comision',
                'total',
                'correo', 
                'whatsapp',
                'numero_muestra',
                'referido',
                'pagado',
                'por_pagar',
                'id_examenes_almacenados',
                'createdAt'],
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
                  nombre_encargago: item.encargado?.nombres || 'Sin Encargado',
                  pagado : item.pagado,
                  por_pagar : item.por_pagar,
                  id_examenes_almacenados : item.id_examenes_almacenados,
                  nombre_examen: item.examenes_almacenado.nombre,
                  fecha_hora: item.createdAt,
              }));
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
    },

    async listCui(req, res) {
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
          const whereClause = {
            estado: { [Op.in]: [1, 2] } 
          };
          if (req.query.cui) {
            whereClause.cui = req.query.cui; 
          }

            const data = await Examenes.findAndCountAll({
                include: [
                    { model: ExamenAlmacenado, attributes: ['nombre'] },
                    { model: Encargado, attributes: ['nombres'] }
                ],
                attributes: [
                  'id',
                  'expediente',
                  'cui', 
                  'comision',
                  'total',
                  'correo', 
                  'whatsapp',
                  'numero_muestra',
                  'referido',
                  'pagado',
                  'por_pagar',
                  'createdAt'],
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
                    nombre_encargago: item.encargado?.nombres || 'Sin Encargado',
                    pagado : item.pagado,
                    por_pagar : item.por_pagar,
                    nombre_examen: item.examenes_almacenado.nombre,
                    fecha_hora: item.createdAt,
                }));
                response.referido = dataResponse;
            } else {
                // Manejar el caso en que response.referido es undefined
                response.referido = ['NO SE ENCONTRARON DATOS']; // O enviar una respuesta adecuada al frontend
            }
            res.send({total:response.totalItems,last_page:response.totalPages, current_page: Page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },
    
    async update(req, res) {
      let form = req.query
      const examenSeleccionado = await Examenes.findOne({ 
        where: { id: form.id } 
      });
      if (!examenSeleccionado) {
        return res.status(300).json({ msg: 'No se encontró el examen a actualizar' });
      }
      await examenSeleccionado.update({estado: 3})
      .then(tipo => {
          res.send(tipo);
      })
      .catch(error => {
          console.log(error)
          return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
      });
    }
}