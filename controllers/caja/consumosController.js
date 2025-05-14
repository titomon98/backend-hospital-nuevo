'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Logs = db.log_traslados;
const Consumo = db.consumos;
const Servicio = db.servicios;
const Cuenta = db.cuentas;
const Expediente = db.expedientes;
const Habitaciones = db.habitaciones;

const Honorario = db.detalle_honorarios
const Medico = db.medicos

const Movimiento = db.detalle_consumo_comunes;
const Comun = db.comunes;

const Movimiento2 = db.detalle_consumo_medicamentos;
const Medicamento = db.medicamentos;

const Movimiento3 = db.detalle_consumo_quirugicos;
const Quirurgico = db.quirurgicos;

const Examenes = db.examenes_realizados;
const ExamenAlmacenado = db.examenes_almacenados;
const Cuenta_Lab = db.lab_cuentas;

const SalaOperaciones = db.servicio_sala_operaciones;
const Categoria = db.categoria_sala_operaciones;

const Op = db.Sequelize.Op;

module.exports = {

    async create(req, res) {
        try {
            let form = req.body.form;
    
            const cuentas = await Cuenta.findAll({
                where: {
                    id_expediente: form.id
                },
                order: [['createdAt', 'DESC']]
            });
    
            let cuentaSeleccionada = null;
            for (const cuenta of cuentas) {
                if (cuenta.dataValues.estado === 1) {
                    cuentaSeleccionada = cuenta;
                    break;
                }
            }
    
            if (!cuentaSeleccionada) {
                return res.status(400).json({ msg: 'No se encontró ninguna cuenta activa para este expediente' });
            }
    
            const id_cuenta = cuentaSeleccionada.dataValues.id;
            let totalCuenta = cuentaSeleccionada.dataValues.total || 0;
            let subtotal = (parseFloat(form.cantidad) * parseFloat(form.servicio.precio));
            let nuevoTotal = (parseFloat(totalCuenta) + parseFloat(subtotal)) || 0;
            let pendientePago = (parseFloat(nuevoTotal) - parseFloat(cuentaSeleccionada.dataValues.total_pagado)) || 0;
    
            const datos = {
                cantidad: form.cantidad,
                descripcion: form.descripcion,
                subtotal: subtotal,
                estado: 1,
                id_servicio: form.servicio.id,
                id_cuenta: id_cuenta,
                created_by: req.body.user
            };

            await cuentaSeleccionada.update({ total: parseFloat(nuevoTotal), pendiente_de_pago: parseFloat(pendientePago) });
    
            // Crea el nuevo consumo
            const nuevoConsumo = await Consumo.create(datos);
            res.send(nuevoConsumo);
        } catch (error) {
            console.error('Error al procesar la solicitud:', error);
            return res.status(500).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },    

    list(req, res) {
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

        const busqueda=req.query.search;
        const page=req.query.page-1;
        const size=req.query.limit;
        const criterio=req.query.criterio;
        const order=req.query.order;


        const { limit, offset } = getPagination(page, size);

        var condition = busqueda ? { [Op.or]: [{ contenido: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Consumo.findAndCountAll({ where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        console.log('data: '+JSON.stringify(data))
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems,last_page:response.totalPages, current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    find (req, res) {
        const id = req.params.id;

        return Consumo.findByPk(id)
        .then(marca => res.status(200).send(marca))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Consumo.update(
            { 
                cantidad: form.cantidad,
                descripcion: form.descripcion,
                subtotal: form.servicio.precio,
                estado: 1,
                id_servicio: form.servicio.id,
                id_cuenta: form.id_cuenta,
                updated_by: req.body.user,
            },
            { where: { 
                id: form.id 
            } }
        )
        .then(marca => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    activate (req, res) {
        Consumo.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(marca => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    deactivate (req, res) {
        Consumo.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(marca =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    
    get(req, res) {
        Consumo.findAll({
            where: {
                estado: 1
            }
        })
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    getSearch (req, res) {
        var busqueda = req.query.search;
        var condition = busqueda?{ [Op.or]:[ {contenido: { [Op.like]: `%${busqueda}%` }}],[Op.and]:[{estado:1}] } : {estado:1} ;
        Consumo.findAll({
            where: condition})
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    async getId (req, res) {
        const id = req.query.id;
        const cuentas = await Cuenta.findAll({
            where: {
                id_expediente: id
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

        Consumo.findAndCountAll({ include: [
            {
                model: Servicio,
                require: true
            },
            {
                model: Cuenta,
                require: true
            }
        ], where: { 
            id_cuenta: id_cuenta,
        }, order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        console.log('data: '+JSON.stringify(data))
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems,last_page:response.totalPages, current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    async  obtenerConsumosPorIdCuenta(req, res) {
        const id = req.params.id;

        try {
            const cuentas = await Cuenta.findAll({
                where: { id_expediente: id },
                order: [['createdAt', 'DESC']]
            });
    
            let cuentaSeleccionada = cuentas.length > 0 ? cuentas[0] : null;
    
            if (!cuentaSeleccionada) {
                return res.status(401).json({ msg: 'No se encontró ninguna cuenta activa para este expediente' });
            }
    
            const id_cuenta = cuentaSeleccionada.dataValues.id;

            const cuenta_lab = await Cuenta_Lab.findAll({
                where: { id_expediente: id },
                order: [['createdAt', 'DESC']]
            });
    
            let cuenta_lab_Seleccionada = null;
            for (const cuenta of cuenta_lab) {
                if (cuenta.dataValues.estado === 1) {
                    cuenta_lab_Seleccionada = cuenta;
                    break;
                }
            }
    
            // Si no hay cuenta activa de laboratorio, usar valores por defecto
            const id_cuenta_lab = cuenta_lab_Seleccionada ? cuenta_lab_Seleccionada.dataValues.id : null;

            //CONSUMO SERVICIOS
            const consumos = await Consumo.findAll({
                where: { id_cuenta: id_cuenta },
                include: [{
                    model: Servicio,
                    attributes: ['descripcion', 'precio']
                }],
                attributes: ['id', 'cantidad', 'descripcion', 'subtotal', 'estado', 'createdAt', 'updatedAt']
            });

            //CONSUMO MATERIAL COMUNES
            const consumosComunes = await Movimiento.findAll({
                where: { id_cuenta: id_cuenta },
                include: [{
                    model: Comun, 
                    attributes: ['nombre']
                }],
                attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado', 'createdAt', 'updatedAt']
            });

            //CONSUMO DE MEDICAMENTOS
            const consumosMedicamentos = await Movimiento2.findAll({
                where: { id_cuenta: id_cuenta },
                include: [{
                    model: Medicamento, 
                    attributes: ['nombre']
                }],
                attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado', 'createdAt', 'updatedAt']
            });

            //CONSUMO DE MATERIAL QUIRURGICO
            const consumosQuirurgicos = await Movimiento3.findAll({
                where: { id_cuenta: id_cuenta },
                include: [{
                    model: Quirurgico, 
                    attributes: ['nombre']
                }],
                attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado', 'createdAt', 'updatedAt']
            });

            //EXAMENES
            const examenes = await Examenes.findAll({
                where: { id_cuenta: id_cuenta_lab },
                include: [{
                    model: ExamenAlmacenado,
                    attributes: ['nombre']
                }],
                attributes: ['id', 'expediente', 'cui', 'comision', 'total', 'correo', 'whatsapp', 'numero_muestra', 'referido', 'id_encargado', 'pagado', 'por_pagar', 'estado', 'createdAt', 'updatedAt']
            });

            //SERVICIO SALA OPERACIONES
            const sala_operaciones = await SalaOperaciones.findAll({
                where: { id_cuenta: id_cuenta },
                include: [{
                    model: Categoria,
                    attributes: ['categoria']
                }],
                attributes: ['id', 'descripcion', 'horas', 'total', 'id_cuenta', 'createdAt', 'updatedAt', 'id_categoria']
            });
    
            // AGRUPANDO OBJETOS PARA GENERAR EL REPORTE
            const reporte = {
                Consumo: consumos,
                'Consumo Comun': consumosComunes,
                'Consumo Medicamentos': consumosMedicamentos,
                'Consumo Quirurgicos': consumosQuirurgicos,
                Examenes: examenes,
                ServicioSalaOperaciones: sala_operaciones
            };
    
            return res.status(200).json(reporte);
    
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            return res.status(500).json({ msg: 'Error al obtener los datos', error: error.message });
        }
    },

    async historialCuenta(req, res) {
        const id = req.params.id;
    
        try {
            const cuentas = await Cuenta.findAll({
                where: { id_expediente: id },
                order: [['createdAt', 'DESC']]
            });
    
            if (cuentas.length === 0) {
                return res.status(400).json({ msg: 'No se encontró ninguna cuenta para este expediente' });
            }

            const cuenta_lab = await Cuenta_Lab.findAll({
                where: { id_expediente: id },
                order: [['createdAt', 'DESC']]
            });

            const historial = {
                Consumo: [], 
                'Consumo Comun': [],
                'Consumo Medicamentos': [],
                'Consumo Quirurgicos': [],
                Examenes: [],
                ServicioSalaOperaciones: []
            };

            for (const cuenta of cuentas) {
                const id_cuenta = cuenta.dataValues.id;
    
                // CONSUMO SERVICIOS
                const consumos = await Consumo.findAll({
                    where: { id_cuenta: id_cuenta },
                    include: [{
                        model: Servicio,
                        attributes: ['descripcion', 'precio']
                    }],
                    attributes: ['id', 'cantidad', 'descripcion', 'subtotal', 'estado', 'createdAt', 'updatedAt']
                });
    
                // CONSUMO MATERIAL COMUNES
                const consumosComunes = await Movimiento.findAll({
                    where: { id_cuenta: id_cuenta },
                    include: [{
                        model: Comun, 
                        attributes: ['nombre']
                    }],
                    attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado', 'createdAt', 'updatedAt']
                });
    
                // CONSUMO DE MEDICAMENTOS
                const consumosMedicamentos = await Movimiento2.findAll({
                    where: { id_cuenta: id_cuenta },
                    include: [{
                        model: Medicamento, 
                        attributes: ['nombre']
                    }],
                    attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado', 'createdAt', 'updatedAt']
                });
    
                // CONSUMO DE MATERIAL QUIRURGICO
                const consumosQuirurgicos = await Movimiento3.findAll({
                    where: { id_cuenta: id_cuenta },
                    include: [{
                        model: Quirurgico, 
                        attributes: ['nombre']
                    }],
                    attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado', 'createdAt', 'updatedAt']
                });

                // SERVICIO SALA OPERACIONES
                const sala_operaciones = await SalaOperaciones.findAll({
                    where: { id_cuenta: id_cuenta },
                    include: [{
                        model: Categoria,
                        attributes: ['categoria']
                    }],
                    attributes: ['id', 'descripcion', 'horas', 'total', 'id_cuenta', 'createdAt', 'updatedAt', 'id_categoria']
                });
    
                historial.Consumo.push(...consumos);
                historial['Consumo Comun'].push(...consumosComunes);
                historial['Consumo Medicamentos'].push(...consumosMedicamentos);
                historial['Consumo Quirurgicos'].push(...consumosQuirurgicos);
                historial.ServicioSalaOperaciones.push(...sala_operaciones);
            }

            for (const cuenta of cuenta_lab) {

                 // Si no hay cuenta activa de laboratorio, usar valores por defecto
                const id_cuenta_lab = cuenta ? cuenta.dataValues.id : null;
            
                    
                // EXAMENES
                const examenes = await Examenes.findAll({
                    where: { id_cuenta: id_cuenta_lab},
                    include: [{
                        model: ExamenAlmacenado,
                        attributes: ['nombre']
                    }],
                    attributes: ['id', 'expediente', 'cui', 'comision', 'total', 'correo', 'whatsapp', 'numero_muestra', 'referido', 'id_encargado', 'pagado', 'por_pagar', 'estado', 'createdAt', 'updatedAt']
                });

                historial.Examenes.push(...examenes);

            }

            return res.status(200).json(historial);
    
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            return res.status(500).json({ msg: 'Error al obtener los datos', error: error.message });
        }
    },

    async getDataSumario(req, res) {
        const { id } = req.params;
      
        try {

            const costoHospitalizacion = await Habitaciones.findOne({
                where: { ocupante: id },
                attributes: ['costo_ambulatorio','costo_diario'],
            });

            const fecha_ingreso = await Logs.findOne({
                where: { id_expediente: id, origen: 'Recién ingresado' },
                order: [['createdAt', 'DESC']],
                attributes: ['createdAt'],
            });

            const idMedico = await Expediente.findOne({
                where: { id: id },
                order: [['createdAt', 'DESC']],
                attributes: ['id_medico'],
            });

          const cuentaSeleccionada = await Cuenta.findOne({
            where: { id_expediente: id, estado: 1 },
            order: [['createdAt', 'DESC']],
          });
      
          if (!cuentaSeleccionada) {
            return res.status(401).json({ msg: 'No se encontró ninguna cuenta activa para este expediente.' });
          }
      
          const id_cuenta = cuentaSeleccionada.id;
      
          const cuentaLabSeleccionada = await Cuenta_Lab.findOne({
            where: { id_expediente: id, estado: 1 },
            order: [['createdAt', 'DESC']],
          });
      
          const id_cuenta_lab = cuentaLabSeleccionada ? cuentaLabSeleccionada.id : null;

          const [
            consumos,
            consumosComunes,
            consumosMedicamentos,
            consumosQuirurgicos,
            examenes,
            salaOperaciones,
            honorarios,
          ] = await Promise.all([

            Consumo.findAll({
              where: { id_cuenta },
              include: [{ model: Servicio, attributes: ['descripcion', 'precio'] }],
              attributes: ['id', 'cantidad', 'descripcion', 'subtotal', 'estado', 'createdAt', 'updatedAt'],
            }),
      
            Movimiento.findAll({
              where: { id_cuenta },
              include: [{ model: Comun, attributes: ['nombre'] }],
              attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado', 'createdAt', 'updatedAt'],
            }),
      
            Movimiento2.findAll({
              where: { id_cuenta },
              include: [{ model: Medicamento, attributes: ['nombre'] }],
              attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado', 'createdAt', 'updatedAt'],
            }),
      
            Movimiento3.findAll({
              where: { id_cuenta },
              include: [{ model: Quirurgico, attributes: ['nombre'] }],
              attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado', 'createdAt', 'updatedAt'],
            }),
      
            id_cuenta_lab
              ? Examenes.findAll({
                  where: { id_cuenta: id_cuenta_lab },
                  include: [{ model: ExamenAlmacenado, attributes: ['nombre'] }],
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
                    'id_encargado',
                    'pagado',
                    'por_pagar',
                    'estado',
                    'createdAt',
                    'updatedAt',
                  ],
                })
              : [],
      
            SalaOperaciones.findAll({
              where: { id_cuenta },
              include: [{ model: Categoria, attributes: ['categoria'] }],
              attributes: ['id', 'descripcion', 'horas', 'total', 'id_cuenta', 'createdAt', 'updatedAt', 'id_categoria'],
            }),
      
            // Honorarios con estado = 1
            Honorario.findAll({
              where: { id_cuenta, estado: 1 },
              attributes: ['id', 'id_medico', 'descripcion', 'total', 'updatedAt', 'estado'],
              include: [{ model: Medico, attributes: ['nombre'] }],
            }),
          ]);

          //NOMBRE DEL MEDICO
          let nombremedico = 'NO ASIGNADO'
          if (idMedico) {
            const nombreMedico = await Medico.findOne({
              where: { id: idMedico.id_medico },
              attributes: ['nombre'],
            });
            nombremedico = nombreMedico && nombreMedico.nombre ? nombreMedico.nombre : 'NO ASIGNADO';
          }

          //NUMERO HABITACION
          let numerohabitacion = 'NO ASIGNADO'
          if (id) {
            const numeroHabitacion = await Habitaciones.findOne({
                where: { ocupante: id },
                order: [['createdAt', 'DESC']],
                attributes: ['numero'],
            });
            numerohabitacion = numeroHabitacion && numeroHabitacion.numero ? numeroHabitacion.numero : 'NO ASIGNADO';
          }

          //fecha a enviar
          const fechaFormateada = fecha_ingreso.createdAt.toISOString().split('T')[0];

          //COSTOS ESTUDIO DE SUEÑO 

          const costo1 = parseFloat(costoHospitalizacion?.costo_ambulatorio) || 0;
          const costo2 = parseFloat(costoHospitalizacion?.costo_diario) || 0;
          // Crear el reporte agrupado
          const reporte = {
            consumos,
            consumosComunes,
            consumosMedicamentos,
            consumosQuirurgicos,
            examenes,
            salaOperaciones,
            honorarios,
            nombremedico,
            numerohabitacion,
            fechaFormateada,
            costo1,
            costo2,
          };
      
          return res.status(200).json(reporte);
        } catch (error) {
          console.error('Error al obtener los datos:', error);
          return res.status(500).json({ msg: 'Error al obtener los datos', error: error.message });
        }
    }      
    
};

