'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Movimiento = db.detalle_consumo_quirugicos;
const Quirurgico = db.quirurgicos;
const Presentacion = db.presentaciones;
const Cuenta = db.cuentas;
const Expediente = db.expedientes;
const Op = db.Sequelize.Op;
const moment = require('moment');

module.exports = {
    async get(req, res) {
        try {
          const id = req.params.id;
          const area = req.params.area
          const page = parseInt(req.query.page) || 1;
          const size = parseInt(req.query.limit) || 20;
          const criterio = req.query.criterio || 'id';
          const order = req.query.order || 'ASC';
      
          // --- Helpers ---
          const getPagination = (page, size) => {
            const limit = size;
            const offset = (page - 1) * limit;
            return { limit, offset };
          };
      
          const getPagingData = (data, page, limit) => {
            const { count: totalItems, rows: referido } = data;
            const totalPages = Math.ceil(totalItems / limit);
            return {
              totalItems,
              referido,
              totalPages,
              currentPage: page
            };
          };
      
          const { limit, offset } = getPagination(page, size);
          const condition = {
            [Op.and]: [
              { id_cuenta: { [Op.like]: `%${id}%` } },
              { descripcion: { [Op.like]: `%${area}%` } }
            ]
          };
      
          const data = await Movimiento.findAndCountAll({
            include: {
              model: Quirurgico,
              required: true,
              include: [{
                model: Presentacion,
                attributes: ['nombre']
              }]
            },
            where: condition,
            order: [[criterio, order]],
            limit,
            offset
          });
      
          const response = getPagingData(data, page, limit);
      
          // --- Formatear fechas ---
          const formattedData = data.rows.map(item => {
            const plainItem = item.get({ plain: true });
            // 📘 Formatear cantidad: quitar .00 o .0 si no hay decimales significativos
            if (plainItem.cantidad !== undefined && plainItem.cantidad !== null) {
              const parsed = parseFloat(plainItem.cantidad);
              plainItem.cantidad =
                Number.isInteger(parsed) ? parsed.toString() : parsed.toFixed(2);
            }

            if (plainItem.descripcion) {
                plainItem.descripcion = plainItem.descripcion
                  .trim()
                  .split(/\s+/)
                  .pop();
              }
          
            // 📘 Formatear fechas
            plainItem.createdAt = plainItem.createdAt
              ? moment.utc(plainItem.createdAt).format('DD/MM/YYYY HH:mm')
              : null;
            plainItem.updatedAt = plainItem.updatedAt
              ? moment.utc(plainItem.updatedAt).format('DD/MM/YYYY HH:mm')
              : null;
          
            return plainItem;
          });
      
          // --- Respuesta final coherente ---
          res.json({
            total: response.totalItems,
            per_page: limit,
            last_page: response.totalPages,
            current_page: response.currentPage,
            from: offset + 1,
            to: offset + formattedData.length,
            data: formattedData
          });
        } catch (error) {
          console.error(error);
          return res.status(400).json({
            msg: 'Ha ocurrido un error, por favor intente más tarde',
            error: error.message
          });
        }
    },
    
    async create(req, res) {
        const restarHoras = (fecha, horas) => {
            let nuevaFecha = new Date(fecha); // Crear una nueva instancia de fecha
            nuevaFecha.setHours(nuevaFecha.getHours() - horas);
            return nuevaFecha;
          };

        const cuentas = await Cuenta.findAll({
            where: {
                id: req.body.form.id_cuenta
            },
            order: [['createdAt', 'DESC']]
          })
          let cuentaSeleccionada = null;
          for (const cuenta of cuentas) {
            if (cuenta.dataValues.estado == 1) {
              cuentaSeleccionada = cuenta;
              break;
            }
          }
          if (!cuentaSeleccionada) {
            return res.status(400).json({ msg: 'No se encontró ninguna cuenta activa para este expediente' });
          }
          const id_cuenta = cuentaSeleccionada.dataValues.id
          const numero_cuenta = cuentaSeleccionada.dataValues.numero
          let totalCuenta = cuentaSeleccionada.dataValues.total || 0
          let Total;
          let nuevoTotal;
        
          console.log(req.body.form.movimiento)
        let form = req.body.form
        let existencia_nueva = 0
        let descripcion;

        if (form.movimiento === 'SALIDAQ') {
            descripcion = 'Consumo de insumos quirúrgicos por la cuenta ' + numero_cuenta + ' En el area de Quirofano'
        } else if (form.movimiento === 'SALIDAH') {
            descripcion = 'Consumo de insumos quirúrgicos por la cuenta ' + numero_cuenta + ' En el area de Hospitalizacion'
        } else if (form.movimiento === 'SALIDAI'){
            descripcion = 'Consumo de insumos quirúrgicos por la cuenta ' + numero_cuenta + ' En el area de Intensivo'
        } else if (form.movimiento === 'SALIDAE'){
            descripcion = 'Consumo de insumos quirúrgicos por la cuenta ' + numero_cuenta + ' En el area de Emergencia'
        }
        if (form.inventariado === 'NO INVENTARIADO') {
            existencia_nueva = 1
        }
        else {
            existencia_nueva = parseInt(form.existencias_actuales) - parseInt(form.cantidad)
        }

        Total = (parseFloat(form.cantidad) * parseFloat(form.precio_venta))
        console.dir(form)
        nuevoTotal = (parseFloat(totalCuenta) + parseFloat(Total))
        await cuentaSeleccionada.update({ total: nuevoTotal});
        console.log("El usuario es: " + form.user)
        const datos = {
            id_quirurgico: form.id_medicamento,
            descripcion: descripcion,
            cantidad: parseFloat(form.cantidad),
            precio_venta: parseFloat(form.precio_venta).toFixed(2),
            total: parseFloat(Total).toFixed(2),
            estado: form.state,
            id_cuenta: id_cuenta,
            createdAt: restarHoras(new Date(), 6),
            updatedAt: restarHoras(new Date(), 6),
            created_by: form.user
        };
        Quirurgico.update({ 
            existencia_actual: existencia_nueva
        },
        { where: { 
            id: form.id_medicamento
        }})
        Movimiento.create(datos)
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
            const data = await Movimiento.findAndCountAll({
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
                    },
                    { model: Quirurgico, attributes: ['id', 'nombre'] }
                ],
                attributes: ['id', 'descripcion', 'cantidad', 'createdAt', 'created_by', 'updated_by', 'estado'],
                order: [[Criterio, Order]], // Ordenamos por createdAt DESC
                limit,
                offset,
                where: whereClause 
            }); 
    
            const response = getPagingData(data, Page, limit);
            if (response.referido) {
                const dataResponse = response.referido.map(item => ({
                    id: item.id,
                    quirurgico_id: item.quirurgico.id,
                    numero_cuenta: item.cuenta.numero,
                    nombre_material: item.quirurgico.nombre,
                    cantidad: item.cantidad,
                    fecha_consumo: item.createdAt,
                    nombre_completo: item.cuenta.expediente.nombres + ' ' + item.cuenta.expediente.apellidos,
                    created_by: item.created_by,
                    updated_by: item.updated_by,
                    estado: item.estado
                }));
    
                response.referido = dataResponse;
            } else {
                response.referido = [];
            }
            res.send({total:response.totalItems,last_page:response.totalPages, current_page: Page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },

    async deactivate(req, res) {
      const id_consumo = req.body.delete.id
      const quirurgico_id = req.body.delete.quirurgico_id
      const cantidad_eliminada = req.body.delete.cantidad
      const responsable = req.body.delete.responsable

      const medicamento = await Quirurgico.findByPk(quirurgico_id);
      if (!medicamento) {
        return res.send('El medicamento no existe');
      }
      if (medicamento.inventariado === "INVENTARIADO"){
        medicamento.existencia_actual = medicamento.existencia_actual + cantidad_eliminada;
      }
      await medicamento.save();

      const movimiento = await Movimiento.findByPk(id_consumo);
      movimiento.estado = 0
      movimiento.updated_by = responsable
      await movimiento.save();

      return res.send('Consumo eliminado correctamente')
    }   
}