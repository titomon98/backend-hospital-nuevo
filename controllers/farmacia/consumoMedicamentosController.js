'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Movimiento = db.detalle_consumo_medicamentos;
const Medicamento = db.medicamentos;
const Cuenta = db.cuentas;
const Op = db.Sequelize.Op;
const moment = require('moment');

module.exports = {
    get(req, res) {
        const id = req.params.id;
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

        const page=req.query.page-1;
        const size=req.query.limit;
        const criterio=req.query.criterio;
        const order=req.query.order;


        const { limit, offset } = getPagination(page, size);
        var condition = { id_cuenta: { [Op.like]: `%${id}%` } };

        Movimiento.findAndCountAll({ where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        const response = getPagingData(data, page, limit);
        res.send({total:response.totalItems,last_page:response.totalPages, current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    
    async create(req, res) {
        const restarHoras = (fecha, horas) => {
            let nuevaFecha = new Date(fecha); // Crear una nueva instancia de fecha
            nuevaFecha.setHours(nuevaFecha.getHours() - horas);
            return nuevaFecha;
          };
          console.log(req.body.form)
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
          console.log("LUNA")

          const id_cuenta = cuentaSeleccionada.dataValues.id
          const numero_cuenta = cuentaSeleccionada.dataValues.numero
          let totalCuenta = cuentaSeleccionada.dataValues.total || 0
          let Total = 0
          let nuevoTotal = 0

        let form = req.body.form
        let existencia_nueva;
        let descripcion

        if (form.movimiento === 'SALIDAQ') {
            descripcion = 'Consumo de medicamentos por la cuenta ' + numero_cuenta + ' En el area de Quirofano'
        } else if (form.movimiento === 'SALIDAH') {
            descripcion = 'Consumo de medicamentos por la cuenta ' + numero_cuenta + ' En el area de Hospitalizacion'
        } else if (form.movimiento === 'SALIDAI'){
            descripcion = 'Consumo de medicamentos por la cuenta ' + numero_cuenta + ' En el area de Intensivo'
        } else if (form.movimiento === 'SALIDAE'){
            descripcion = 'Consumo de medicamentos por la cuenta ' + numero_cuenta + ' En el area de Emergencia'
        }
        console.log('-------------------',form)
        existencia_nueva = parseInt(form.existencias_actuales) - parseInt(form.cantidad)
        Total = (parseFloat(form.cantidad) * parseFloat(form.precio_venta))
        nuevoTotal = (parseFloat(totalCuenta) + parseFloat(Total))
        await cuentaSeleccionada.update({ total: nuevoTotal});
        const datos = {
            id_medicamento: form.id_medicine,
            descripcion: descripcion,
            cantidad: form.cantidad,
            precio_venta: form.precio_venta,
            total: Total,
            estado: form.state,
            id_cuenta: id_cuenta,
            estado: 1,
            createdAt: restarHoras(new Date(), 6),
            updatedAt: restarHoras(new Date(), 6),
        };
        Medicamento.update({ 
            existencia_actual: existencia_nueva
        },
        { where: { 
            id: form.id_medicine 
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
            const data = await Movimiento.findAndCountAll({
                include: [
                    { model: Cuenta, attributes: ['numero'] },
                    { model: Medicamento, attributes: ['nombre'] }
                ],
                attributes: ['cantidad', 'createdAt'],
                order: [[Criterio, Order]], // Ordenamos por createdAt DESC
                limit,
                offset,
                where: whereClause 
            }); 
    
            const response = getPagingData(data, Page, limit);
    
            if (response.referido) {
                const dataResponse = response.referido.map(item => ({
                    numero_cuenta: item.cuenta.numero,
                    nombre_medicamento: item.medicamento.nombre,
                    cantidad: item.cantidad,
                    fecha_consumo: item.createdAt,
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
    }    
}