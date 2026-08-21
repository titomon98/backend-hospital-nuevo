'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Examenes = db.examenes_realizados;
const ExamenAlmacenado = db.examenes_almacenados;
const Encargado = db.encargados;
const Expediente = db.expedientes;
const Cuenta = db.lab_cuentas;
const Asueto = db.asuetos

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
      }

      const today = new Date();
      let form = req.body.form;
      const usuario = req.user?.user ?? req.body.user;
      const esExterno = form.examenExterior == true || form.examenExterior == 'true';
      const esNuevo = form.NewExpediente == true || form.NewExpediente == 'true';
      const comisionNombre = (form.comision && typeof form.comision === 'object')
        ? (form.comision.nombre ?? null)
        : (form.comision || null);

      const t = await db.sequelize.transaction();
      try {
        const examenesAlmacenados = await ExamenAlmacenado.findAll({
          where: { id: form.id_examenes_almacenados },
          transaction: t,
        });
        if (!examenesAlmacenados.length) {
          await t.rollback();
          return res.status(400).json({ msg: 'No se encontraron los exámenes seleccionados' });
        }

        // 1) Resolver el expediente: existente (agendado desde enfermería/caja) o
        //    nuevo (paciente que ingresa directo en laboratorio).
        let id_expediente = form.id_expediente;
        let nombreExpediente = form.nombre;
        if (esNuevo) {
          // Fechas de negocio en GT-6, igual que en el resto del sistema.
          const ahoraGT = restarHoras(new Date(), 6);
          const expediente = await Expediente.create({
            nombres: form.nombre,
            apellidos: form.apellido,
            expediente: 'INGRESO EN LABORATORIO',
            primer_ingreso: ahoraGT,
            fecha_ingreso_reciente: ahoraGT,
            hora_ingreso_reciente: ahoraGT,
            nacimiento: '0001-01-01',
            cui: form.cui,
            telefono: form.whatsapp,
            direccion: 'INGRESO EN LABORATORIO',
            nombre_encargado: 'INGRESO EN LABORATORIO',
            contacto_encargado: 'INGRESO EN LABORATORIO',
            cui_encargado: 'INGRESO EN LABORATORIO',
            direccion_encargado: 'INGRESO EN LABORATORIO',
            estado: 11,
            created_by: usuario,
            updated_by: usuario,
          }, { transaction: t });
          await expediente.update(
            { expediente: `${today.getFullYear()}-${String(expediente.id).padStart(4, '0')}` },
            { transaction: t }
          );
          id_expediente = expediente.id;
          nombreExpediente = `${form.nombre} ${form.apellido}`;
        }

        // 2) Cuenta de laboratorio. Los exámenes externos no se cobran (total 0).
        const totalCuenta = esExterno ? 0 : form.total;
        const cuentaCreada = await Cuenta.create({
          numero: 1,
          total: totalCuenta,
          estado: 1,
          total_pagado: 0,
          pendiente_de_pago: totalCuenta,
          id_expediente,
          fecha_corte: null,
          descuento: 0,
          solicitud_descuento: 3,
          subtotal: 0,
          created_by: usuario,
          updated_by: usuario,
        }, { transaction: t });
        await cuentaCreada.update({ numero: cuentaCreada.id }, { transaction: t });

        // 3) Un examen realizado por cada examen almacenado seleccionado.
        //    Interno: estado 1 (en progreso) y se cobra; externo: estado 2 y sin costo.
        const examenesCreados = await Promise.all(
          examenesAlmacenados.map((examenAlmacenado) => Examenes.create({
            expediente: nombreExpediente,
            edad: form.edad,
            cui: form.cui,
            comision: comisionNombre,
            total: esExterno ? 0 : examenAlmacenado.precio_normal,
            correo: form.correo,
            whatsapp: form.whatsapp,
            numero_muestra: form.numero_muestra,
            referido: form.referido,
            nombre_factura: form.factura,
            nit: form.nit,
            id_encargado: form.id_encargado?.id || null,
            pagado: 0,
            por_pagar: esExterno ? 0 : examenAlmacenado.precio_normal,
            id_examenes_almacenados: examenAlmacenado.id,
            estado: esExterno ? 2 : 1,
            id_cuenta: cuentaCreada.id,
            id_lab_cuentas: cuentaCreada.id,
            created_by: usuario,
            updated_by: usuario,
          }, { transaction: t }))
        );

        await t.commit();
        return res.send(examenesCreados);
      } catch (error) {
        await t.rollback();
        console.error('Error al crear el examen:', error);
        return res.status(500).json({ msg: 'Error al crear el examen' });
      }
      

    },

    async getsearchExaAlmacenados(req, res) {
        const busqueda = req.query.search;
        const condition = busqueda ? { 
          nombre: { [Op.like]: `%${busqueda}%` }  // Cambio a Op.like y nombres (plural)
        } : null;
      
        
      // OBTENER DIA ACTUAL
      const currentDate = new Date();

      //VALIDAR SI ES DIA ASUETO
      const formattedDate = currentDate.toISOString().split("T")[0]; // Formato YYYY-MM-DD
      const isAsueto = await Asueto.findOne({
        where: { fecha: formattedDate },
      });
      
      //VALIDAR SI ES SABADO DESPUES DE LA 1:00PM
      const isSaturdayAfter1PM =
        currentDate.getDay() === 6 &&
        (currentDate.getHours() >= 13 || (currentDate.getHours() === 12 && currentDate.getMinutes() >= 60));

      //VALIDANDO CONDICIONES
      const shouldUseSurcharge = isSaturdayAfter1PM || isAsueto;

        try {
          const data = await ExamenAlmacenado.findAll({ where: condition });
          //MODIFICAR PRECIO EN BASE A CONDICIONES
          const modifiedData = data.map((examen) => {
            const examenData = examen.toJSON()
            if (shouldUseSurcharge) {
              examenData.precio_normal = examenData.precio_sobrecargo || examenData.precio_normal
            }
            return examenData
          });
          res.send(modifiedData);
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

      // OBTENER DIA ACTUAL
      const currentDate = new Date();

      //VALIDAR SI ES DIA ASUETO
      const formattedDate = currentDate.toISOString().split("T")[0]; // Formato YYYY-MM-DD
      const isAsueto = await Asueto.findOne({
        where: { fecha: formattedDate },
      });

      //VALIDAR SI ES SABADO DESPUES DE LA 1:00PM
      const isSaturdayAfter1PM =
        currentDate.getDay() === 6 &&
        (currentDate.getHours() >= 13 || (currentDate.getHours() === 12 && currentDate.getMinutes() >= 60));

      //VALIDANDO CONDICIONES
      const shouldUseSurcharge = isSaturdayAfter1PM || isAsueto;

      try {
        const { count, rows: data } = await ExamenAlmacenado.findAndCountAll({ 
          where: condition,
          limit: limit,
          offset: (page - 1) * limit 
        });

        //MODIFICAR PRECIO EN BASE A CONDICIONES
        const modifiedData = data.map((examen) => {
          const examenData = examen.toJSON()
          if (shouldUseSurcharge) {
            examenData.precio_normal = examenData.precio_sobrecargo || examenData.precio_normal
          }
          return examenData
        });
            
        res.json({
          data: modifiedData,
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
                  'edad',
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
                order: [['numero_muestra', 'DESC']], // Ordenamos por createdAt DESC
                limit,
                offset,
                where: whereClause 
            }); 
    
            const response = getPagingData(data, Page, limit);
    
            if (response.referido) {
                const dataResponse = response.referido.map(item => ({
                    id: item.id,
                    nombre : item.expediente,
                    edad: item.edad,
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
                'edad',
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
                  edad: item.edad,
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
                'edad',
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
                  edad: item.edad,
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
      try {
        const { id } = req.params;

        if (!id) {
          return res.status(400).json({ msg: 'El parámetro id_expediente es requerido.' });
        }
        const cuenta = await Cuenta.findAndCountAll({ where: { id_expediente: id } });

        if (!cuenta.rows || cuenta.rows.length === 0) {
          return res.status(404).json({ msg: 'No se encontró ninguna cuenta para el expediente proporcionado.' });
        }
        let dataResponse = [];

        // Recorremos todas las cuentas encontradas
        for (const cta of cuenta.rows) {
          const examenes = await Examenes.findAll({
            where: {
              id_lab_cuentas: cta.id
            },
            include: [
              { model: ExamenAlmacenado, attributes: ['nombre'] },
              { model: Encargado, attributes: ['nombres'] }
            ],
            attributes: [
              'id',
              'expediente',
              'edad',
              'cui',
              'comision',
              'total',
              'correo',
              'whatsapp',
              'numero_muestra',
              'referido',
              'pagado',
              'por_pagar',
              'createdAt'
            ]
          });
          console.log(examenes)
          // Mapeamos los resultados de cada examen y los agregamos al arreglo general
          const examenesFormateados = examenes.map(item => ({
            id: item.id,
            nombre: item.expediente,
            edad: item.edad,
            cui: item.cui,
            total: item.total,
            whatsapp: item.whatsapp,
            numero_muestra: item.numero_muestra,
            nombre_encargado: item.encargado?.nombres || 'Sin Encargado',
            pagado: item.pagado,
            por_pagar: item.por_pagar,
            nombre_examen: item.examenes_almacenado?.nombre || 'Sin Examen',
            fecha_hora: item.createdAt,
            id_cuenta: cta.id, // Puedes incluir también el id de la cuenta si te sirve
          }));

          // Agregar los resultados de esta cuenta al arreglo principal
          dataResponse.push(...examenesFormateados);
        }

        res.send(dataResponse);
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
      await examenSeleccionado.update({estado: 4, updated_by: req.user?.user ?? req.body.user})
      .then(tipo => {
          res.send(tipo);
      })
      .catch(error => {
          console.log(error)
          return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
      });
    },

    async getExamenesPorCuenta(req, res) {
      const { id } = req.params; // id del expediente

      try {
          const cuentaLab = await Cuenta_Lab.findOne({
              where: { id_expediente: id, estado: 1 },
              order: [['createdAt', 'DESC']],
          });

          if (!cuentaLab) {
              return res.status(200).json({ total: 0, examenes: [] });
          }

          const examenes = await Examenes.findAll({
              where: { id_lab_cuentas: cuentaLab.id },
              include: [{ model: ExamenAlmacenado, attributes: ['nombre'] }],
              attributes: ['id', 'total', 'estado'],
          });

          const total = examenes.reduce((acc, item) => acc + parseFloat(item.total || 0), 0);

          return res.status(200).json({ total, examenes });
      } catch (error) {
          console.error('Error al obtener exámenes:', error);
          return res.status(500).json({ msg: 'Error al obtener los exámenes' });
      }
  },

  async eliminarExamen(req, res) {
    const { id, id_cuenta } = req.body;

    if (!id || !id_cuenta) {
      return res.status(400).json({ msg: 'Los parámetros id e id_cuenta son requeridos.' });
    }

    try {
      const examen = await Examenes.findOne({ where: { id } });

      if (!examen) {
        return res.status(404).json({ msg: 'No se encontró el examen a eliminar.' });
      }

      if (parseFloat(examen.pagado) != 0) {
        return res.status(400).json({ msg: 'No se puede eliminar el estudio porque ya tiene un pago registrado.' });
      }

      await examen.destroy();

      const examenesRestantes = await Examenes.count({
        where: { id_cuenta: id_cuenta }
      });

      let cuentaEliminada = false;
      if (examenesRestantes === 0) {
        await Cuenta.destroy({ where: { id: id_cuenta } });
        cuentaEliminada = true;
      }

      res.send({ msg: 'Estudio eliminado correctamente', cuentaEliminada });
    } catch (error) {
      console.error('Error al eliminar el examen:', error);
      return res.status(500).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
    }
  }
}