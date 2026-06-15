'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Logs = db.log_traslados;
const Consumo = db.consumos;
const Servicio = db.servicios;
const Cuenta = db.cuentas;
const Expediente = db.expedientes;
const Habitaciones = db.habitaciones;
const DetalleHabitaciones = db.detalle_habitaciones;

const Honorario = db.detalle_honorarios
const Medico = db.medicos

const MovimientoComun = db.detalle_consumo_comunes;
const Comun = db.comunes;

const MovimientoMedicamentos = db.detalle_consumo_medicamentos;
const Medicamento = db.medicamentos;

const MovimientoQuirurgico = db.detalle_consumo_quirugicos;
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
            const consumosComunes = await MovimientoComun.findAll({
                where: { id_cuenta: id_cuenta },
                include: [{
                    model: Comun, 
                    attributes: ['nombre']
                }],
                attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado', 'createdAt', 'updatedAt']
            });

            //CONSUMO DE MEDICAMENTOS
            const consumosMedicamentos = await MovimientoMedicamentos.findAll({
                where: { id_cuenta: id_cuenta },
                include: [{
                    model: Medicamento, 
                    attributes: ['nombre']
                }],
                attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado', 'createdAt', 'updatedAt']
            });

            //CONSUMO DE MATERIAL QUIRURGICO
            const consumosQuirurgicos = await MovimientoQuirurgico.findAll({
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
                const consumosComunes = await MovimientoComun.findAll({
                    where: { id_cuenta: id_cuenta },
                    include: [{
                        model: Comun, 
                        attributes: ['nombre']
                    }],
                    attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado', 'createdAt', 'updatedAt']
                });
    
                // CONSUMO DE MEDICAMENTOS
                const consumosMedicamentos = await MovimientoMedicamentos.findAll({
                    where: { id_cuenta: id_cuenta },
                    include: [{
                        model: Medicamento, 
                        attributes: ['nombre']
                    }],
                    attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado', 'createdAt', 'updatedAt']
                });
    
                // CONSUMO DE MATERIAL QUIRURGICO
                const consumosQuirurgicos = await MovimientoQuirurgico.findAll({
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
            let fecha_ingreso = await Expediente.findOne({
                where: { id: id },
                order: [['createdAt', 'DESC']],
                attributes: ['fecha_ingreso_reciente', 'hora_ingreso_reciente'],
            });

            const idMedico = await Expediente.findOne({
                where: { id: id },
                order: [['createdAt', 'DESC']],
                attributes: ['id_medico'],
            });

            const cuentaSeleccionada = await Cuenta.findOne({
                where: { id_expediente: id },
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
                consumosAnestesicos,
                consumosQuirurgicos,
                examenes,
                salaOperaciones,
                honorarios,
                detallesHabitacion,
            ] = await Promise.all([

                Consumo.findAll({
                    where: { id_cuenta },
                    include: [{ model: Servicio, attributes: ['descripcion', 'precio'] }],
                    attributes: ['id', 'cantidad', 'descripcion', 'subtotal', 'estado', 'createdAt', 'updatedAt'],
                }),

                MovimientoComun.findAll({
                    where: { id_cuenta: id_cuenta, estado: 1 },
                    include: [{ model: Comun, attributes: ['nombre'] }],
                    attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado', 'createdAt', 'updatedAt'],
                }),

                MovimientoMedicamentos.findAll({
                    where: { id_cuenta: id_cuenta, estado: 1 },
                    include: [{ model: Medicamento, attributes: ['nombre'], where: { anestesico: { [Op.eq]: 1 } } }],
                    attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado', 'createdAt', 'updatedAt'],
                }),

                MovimientoMedicamentos.findAll({
                    where: { id_cuenta: id_cuenta, estado: 1 },
                    include: [{ model: Medicamento, attributes: ['nombre'], where: { anestesico: { [Op.eq]: 0 } } }],
                    attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado', 'createdAt', 'updatedAt'],
                }),

                MovimientoQuirurgico.findAll({
                    where: { id_cuenta: id_cuenta, estado: 1 },
                    include: [{ model: Quirurgico, attributes: ['nombre'] }],
                    attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado', 'createdAt', 'updatedAt'],
                }),

                id_cuenta_lab
                    ? Examenes.findAll({
                        where: { id_cuenta: id_cuenta_lab },
                        include: [{ model: ExamenAlmacenado, attributes: ['nombre'] }],
                        attributes: [
                            'id', 'expediente', 'cui', 'comision', 'total', 'correo', 'whatsapp',
                            'numero_muestra', 'referido', 'id_encargado', 'pagado', 'por_pagar',
                            'estado', 'createdAt', 'updatedAt',
                        ],
                    })
                    : [],

                SalaOperaciones.findAll({
                    where: { id_cuenta },
                    include: [{ model: Categoria, attributes: ['categoria'] }],
                    attributes: ['id', 'descripcion', 'horas', 'total', 'id_cuenta', 'createdAt', 'updatedAt', 'id_categoria'],
                }),

                Honorario.findAll({
                    where: { id_cuenta, estado: 1 },
                    attributes: ['id', 'id_medico', 'descripcion', 'total', 'updatedAt', 'estado'],
                    include: [{ model: Medico, attributes: ['nombre'] }],
                }),

                DetalleHabitaciones.findAll({
                    where: { id_cuenta, estado: 1 },
                    attributes: ['tipo_habitacion', 'costo_base', 'ingreso', 'salida'],
                }),
            ]);

            // SEPARAR HONORARIOS NORMALES DE EMERGENCIA MÉDICO INTERNO
            const honorariosNormales = honorarios.filter(h => h.descripcion !== 'pago a medico interno por emergencia');
            const emergenciaMedicoInterno = honorarios.filter(h => h.descripcion === 'pago a medico interno por emergencia');
            const EmergenciasMedicoInterno = emergenciaMedicoInterno.reduce((acc, item) => acc + parseFloat(item.total), 0);

            // NOMBRE DEL MEDICO
            let nombremedico = 'NO ASIGNADO';
            if (idMedico) {
                const nombreMedico = await Medico.findOne({
                    where: { id: idMedico.id_medico },
                    attributes: ['nombre'],
                });
                nombremedico = nombreMedico?.nombre ?? 'NO ASIGNADO';
            }

            // NUMERO HABITACION
            let numerohabitacion = 'NO ASIGNADO';
            if (id) {
                const numeroHabitacion = await Habitaciones.findOne({
                    where: { ocupante: id },
                    order: [['createdAt', 'DESC']],
                    attributes: ['numero'],
                });
                numerohabitacion = numeroHabitacion?.numero ?? 'NO ASIGNADO';
            }

            // FECHA A ENVIAR
            let formato = fecha_ingreso.fecha_ingreso_reciente + 'T' + fecha_ingreso.hora_ingreso_reciente;
            const fechaFormateada = formato;

            // Cálculo de días según reglas de corte a las 2PM
            function calcularDiasHabitacion(ingreso, salida) {
                const fechaIngreso = new Date(ingreso);
                const fechaSalida  = salida ? new Date(salida) : new Date();

                const minutosIngreso = fechaIngreso.getHours() * 60 + fechaIngreso.getMinutes();
                const MIN_7AM = 7  * 60;
                const MIN_2PM = 14 * 60;

                let dias = 0;

                const primerCorte2PM = new Date(fechaIngreso);
                primerCorte2PM.setHours(14, 0, 0, 0);

                if (minutosIngreso < MIN_7AM) {
                    dias += 1;
                } else if (minutosIngreso < MIN_2PM) {
                    // sin cargo extra
                } else {
                    dias += 1;
                    primerCorte2PM.setDate(primerCorte2PM.getDate() + 1);
                }

                if (fechaSalida > primerCorte2PM) {
                    const diffMs   = fechaSalida - primerCorte2PM;
                    const periodos = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
                    dias += periodos;
                }

                return Math.max(dias, 1);
            }

            let costoTotal = 0.0;
            let costoIntensivo = 0.0;
            for (const detalle of detallesHabitacion) {
                const dias = calcularDiasHabitacion(detalle.ingreso, detalle.salida);
                const costoTotalInterno = parseFloat(detalle.costo_base) * dias;
                if (detalle.tipo_habitacion === 'Intensivo') {
                    costoIntensivo += costoTotalInterno;
                } else {
                    costoTotal += costoTotalInterno;
                }
            }

            const reporte = {
                consumos,
                consumosComunes,
                consumosMedicamentos,
                consumosAnestesicos,
                consumosQuirurgicos,
                examenes,
                salaOperaciones,
                honorarios: honorariosNormales,
                EmergenciasMedicoInterno,
                nombremedico,
                numerohabitacion,
                fechaFormateada,
                costoTotal,
                costoIntensivo
            };

            return res.status(200).json(reporte);
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            return res.status(500).json({ msg: 'Error al obtener los datos', error: error.message });
        }
    },
    
    async getHojaEmergencia(req, res) {
        const { id } = req.params;

        try {
            const expediente = await Expediente.findOne({
                where: { id },
                attributes: [
                    'id', 'nombres', 'apellidos', 'nacimiento', 'telefono',
                    'direccion', 'fecha_ingreso_reciente', 'hora_ingreso_reciente',
                    'id_medico'
                ],
            });

            if (!expediente) {
                return res.status(404).json({ msg: 'Expediente no encontrado' });
            }

            const cuenta = await Cuenta.findOne({
                where: { id_expediente: id },
                order: [['createdAt', 'DESC']],
                attributes: ['id', 'motivo', 'motivo_egreso', 'descripcion', 'otros', 'fecha_ingreso', 'hora_ingreso'],
            });

            if (!cuenta) {
                return res.status(404).json({ msg: 'No se encontró cuenta para este expediente' });
            }

            const id_cuenta = cuenta.id;

            const cuentaLab = await Cuenta_Lab.findOne({
                where: { id_expediente: id, estado: 1 },
                order: [['createdAt', 'DESC']],
            });
            const id_cuenta_lab = cuentaLab ? cuentaLab.id : null;

            let nombreMedico = 'NO ASIGNADO';
            if (expediente.id_medico) {
                const medico = await Medico.findOne({
                    where: { id: expediente.id_medico },
                    attributes: ['nombre'],
                });
                nombreMedico = medico?.nombre ?? 'NO ASIGNADO';
            }

            const [
                consumosMedicamentos,
                consumosAnestesicos,
                consumosQuirurgicos,
                consumosComunes,
                consumosServicios,
                examenes,
                honorarios,
                honorariosEmergencia,
                detallesHabitacion,
            ] = await Promise.all([
                MovimientoMedicamentos.findAll({
                    where: { id_cuenta, estado: 1 },
                    include: [{ model: Medicamento, attributes: ['nombre'], where: { anestesico: { [Op.eq]: 0 } }, required: true }],
                    attributes: ['total'],
                }),
                MovimientoMedicamentos.findAll({
                    where: { id_cuenta, estado: 1 },
                    include: [{ model: Medicamento, attributes: ['nombre'], where: { anestesico: { [Op.eq]: 1 } }, required: true }],
                    attributes: ['total'],
                }),
                MovimientoQuirurgico.findAll({
                    where: { id_cuenta, estado: 1 },
                    attributes: ['total'],
                }),
                MovimientoComun.findAll({
                    where: { id_cuenta, estado: 1 },
                    attributes: ['total'],
                }),
                Consumo.findAll({
                    where: { id_cuenta },
                    attributes: ['subtotal'],
                }),
                id_cuenta_lab
                    ? Examenes.findAll({
                        where: { id_cuenta: id_cuenta_lab },
                        include: [{ model: ExamenAlmacenado, attributes: ['nombre'] }],
                        attributes: ['id', 'total'],
                    })
                    : [],
                Honorario.findAll({
                    where: {
                        id_cuenta,
                        estado: 1,
                        descripcion: { [Op.ne]: 'pago a medico interno por emergencia' }
                    },
                    attributes: ['total'],
                }),
                Honorario.findAll({
                    where: {
                        id_cuenta,
                        estado: 1,
                        descripcion: 'pago a medico interno por emergencia'
                    },
                    attributes: ['total'],
                }),
                DetalleHabitaciones.findAll({
                    where: { id_cuenta, estado: 1 },
                    attributes: ['tipo_habitacion', 'costo_base', 'ingreso', 'salida'],
                }),
            ]);

            // Suma segura contra null/undefined/NaN
            const sumar = (arr, campo) =>
                arr.reduce((acc, item) => {
                    const val = parseFloat(item[campo]);
                    return acc + (isNaN(val) ? 0 : val);
                }, 0);

            // Costo de habitación tipo Emergencia: costo_base cubre 2 horas, luego Q25/hora extra
            let costoEmergencia = 0.0;
            for (const detalle of detallesHabitacion) {
                if (detalle.tipo_habitacion === 'Emergencia') {
                    const fechaIngreso = new Date(detalle.ingreso);

                    let fechaSalida;
                    if (detalle.salida) {
                        fechaSalida = new Date(detalle.salida);
                    } else {
                        // Hora actual ajustada a GMT-6
                        fechaSalida = new Date(new Date().getTime() - (6 * 60 * 60 * 1000));
                    }

                    const diffMs = fechaSalida - fechaIngreso;
                    const horasTotales = diffMs / (1000 * 60 * 60);
                    const horasExtra = Math.floor(Math.max(horasTotales - 2, 0));

                    costoEmergencia += parseFloat(detalle.costo_base || 0) + (horasExtra * 25);
                }
            }

            const totalMedicamentos      = sumar(consumosMedicamentos,  'total');
            const totalAnestesicos       = sumar(consumosAnestesicos,   'total');
            const totalQuirurgico        = sumar(consumosQuirurgicos,   'total');
            const totalComun             = sumar(consumosComunes,       'total');
            const totalOtros             = sumar(consumosServicios,     'subtotal');
            const totalExamenes          = sumar(examenes,              'total');
            const totalHonorarios        = sumar(honorarios,            'total');
            const totalDerechoEmergencia = sumar(honorariosEmergencia,  'total') + costoEmergencia;

            const nombresExamenes = examenes
                .map(e => e.examenes_almacenado?.nombre)
                .filter(Boolean)
                .join(', ');

            const nacimiento = new Date(expediente.nacimiento);
            const hoy = new Date();
            let edad = hoy.getFullYear() - nacimiento.getFullYear();
            const m = hoy.getMonth() - nacimiento.getMonth();
            if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;

            const toFixed2 = (n) => parseFloat((isNaN(n) ? 0 : n).toFixed(2));

            const subtotalConsumos = totalMedicamentos + totalQuirurgico + totalAnestesicos + totalComun + totalOtros;
            const totalAPagar      = subtotalConsumos + totalDerechoEmergencia + totalExamenes + totalHonorarios;

            return res.status(200).json({
                nombre:       `${expediente.nombres ?? ''} ${expediente.apellidos ?? ''}`.trim(),
                edad:         isNaN(edad) ? 0 : edad,
                direccion:    expediente.direccion  ?? '',
                telefono:     expediente.telefono   ?? '',
                fechaIngreso: expediente.fecha_ingreso_reciente ?? cuenta.fecha_ingreso ?? '',
                horaIngreso:  expediente.hora_ingreso_reciente  ?? cuenta.hora_ingreso  ?? '',

                motivo:        cuenta.motivo        ?? '',
                diagnostico:   cuenta.descripcion   ?? '',
                tratamiento:   cuenta.otros         ?? '',
                observaciones: cuenta.motivo_egreso ?? '',
                medico:        nombreMedico,
                seHospitaliza: false,

                examenes: nombresExamenes,

                totalMedicamentos:       toFixed2(totalMedicamentos),
                totalQuirurgico:         toFixed2(totalQuirurgico),
                totalAnestesicos:        toFixed2(totalAnestesicos),
                totalComun:              toFixed2(totalComun),
                totalOtros:              toFixed2(totalOtros),
                totalExamenes:           toFixed2(totalExamenes),
                totalHonorarios:         toFixed2(totalHonorarios),
                totalDerechoEmergencia:  toFixed2(totalDerechoEmergencia),
                totalAPagar:             toFixed2(totalAPagar),
            });

        } catch (error) {
            console.error('Error al obtener hoja de emergencia:', error);
            return res.status(500).json({ msg: 'Error al obtener datos de hoja de emergencia', error: error.message });
        }
    },

    async getCuentaParcial(req, res) {
        const { id } = req.params;

        try {
            const expediente = await Expediente.findOne({
                where: { id },
                attributes: ['id', 'nombres', 'apellidos', 'fecha_ingreso_reciente', 'hora_ingreso_reciente', 'id_medico'],
            });

            if (!expediente) {
                return res.status(404).json({ msg: 'Expediente no encontrado' });
            }

            const cuenta = await Cuenta.findOne({
                where: { id_expediente: id },
                order: [['createdAt', 'DESC']],
            });

            if (!cuenta) {
                return res.status(404).json({ msg: 'No se encontró cuenta para este expediente' });
            }

            const id_cuenta = cuenta.id;

            const cuentaLab = await Cuenta_Lab.findOne({
                where: { id_expediente: id, estado: 1 },
                order: [['createdAt', 'DESC']],
            });
            const id_cuenta_lab = cuentaLab ? cuentaLab.id : null;

            let nombremedico = 'NO ASIGNADO';
            if (expediente.id_medico) {
                const medico = await Medico.findOne({
                    where: { id: expediente.id_medico },
                    attributes: ['nombre'],
                });
                nombremedico = medico?.nombre ?? 'NO ASIGNADO';
            }

            let numerohabitacion = 'NO ASIGNADO';
            const habitacion = await Habitaciones.findOne({
                where: { ocupante: id },
                order: [['createdAt', 'DESC']],
                attributes: ['numero'],
            });
            numerohabitacion = habitacion?.numero ?? 'NO ASIGNADO';

            const [
                consumos,
                consumosComunes,
                consumosMedicamentos,
                consumosAnestesicos,
                consumosQuirurgicos,
                examenes,
                salaOperaciones,
                honorarios,
                detallesHabitacion,
            ] = await Promise.all([
                Consumo.findAll({
                    where: { id_cuenta },
                    include: [{ model: Servicio, attributes: ['descripcion', 'precio'] }],
                    attributes: ['id', 'cantidad', 'descripcion', 'subtotal', 'estado'],
                }),
                MovimientoComun.findAll({
                    where: { id_cuenta, estado: 1 },
                    include: [{ model: Comun, attributes: ['nombre'] }],
                    attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado'],
                }),
                MovimientoMedicamentos.findAll({
                    where: { id_cuenta, estado: 1 },
                    include: [{ model: Medicamento, attributes: ['nombre'], where: { anestesico: { [Op.eq]: 1 } }, required: true }],
                    attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado'],
                }),
                MovimientoMedicamentos.findAll({
                    where: { id_cuenta, estado: 1 },
                    include: [{ model: Medicamento, attributes: ['nombre'], where: { anestesico: { [Op.eq]: 0 } }, required: true }],
                    attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado'],
                }),
                MovimientoQuirurgico.findAll({
                    where: { id_cuenta, estado: 1 },
                    include: [{ model: Quirurgico, attributes: ['nombre'] }],
                    attributes: ['id', 'descripcion', 'cantidad', 'precio_venta', 'total', 'estado'],
                }),
                id_cuenta_lab
                    ? Examenes.findAll({
                        where: { id_cuenta: id_cuenta_lab },
                        include: [{ model: ExamenAlmacenado, attributes: ['nombre'] }],
                        attributes: ['id', 'total', 'estado'],
                    })
                    : [],
                SalaOperaciones.findAll({
                    where: { id_cuenta },
                    include: [{ model: Categoria, attributes: ['categoria'] }],
                    attributes: ['id', 'descripcion', 'horas', 'total'],
                }),
                Honorario.findAll({
                    where: { id_cuenta, estado: 1 },
                    attributes: ['id', 'id_medico', 'descripcion', 'total'],
                    include: [{ model: Medico, attributes: ['nombre'] }],
                }),
                DetalleHabitaciones.findAll({
                    where: { id_cuenta, estado: 1 },
                    attributes: ['tipo_habitacion', 'costo_base', 'ingreso', 'salida', 'id_habitacion'],
                }),
            ]);

            // Cargar habitaciones para saber cuáles son ambulatorias
            const idsHabitacion = [...new Set(detallesHabitacion.map(d => d.id_habitacion).filter(Boolean))];
            const habitacionesMap = {};
            if (idsHabitacion.length > 0) {
                const habs = await Habitaciones.findAll({
                    where: { id: idsHabitacion },
                    attributes: ['id', 'costo_ambulatorio'],
                });
                habs.forEach(h => { habitacionesMap[h.id] = h; });
            }

            function calcularDiasHabitacion(ingreso, salida) {
                const fechaIngreso = new Date(ingreso);
                const fechaSalida  = salida ? new Date(salida) : new Date();
                const minutosIngreso = fechaIngreso.getHours() * 60 + fechaIngreso.getMinutes();
                const MIN_7AM = 7  * 60;
                const MIN_2PM = 14 * 60;
                let dias = 0;
                const primerCorte2PM = new Date(fechaIngreso);
                primerCorte2PM.setHours(14, 0, 0, 0);
                if (minutosIngreso < MIN_7AM) {
                    dias += 1;
                } else if (minutosIngreso >= MIN_2PM) {
                    dias += 1;
                    primerCorte2PM.setDate(primerCorte2PM.getDate() + 1);
                }
                if (fechaSalida > primerCorte2PM) {
                    const diffMs   = fechaSalida - primerCorte2PM;
                    const periodos = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
                    dias += periodos;
                }
                return Math.max(dias, 1);
            }

            let costoTotal = 0.0;
            let costoIntensivo = 0.0;
            for (const detalle of detallesHabitacion) {
                const costoBase = parseFloat(detalle.costo_base || 0);
                const hab = habitacionesMap[detalle.id_habitacion];
                const esAmbulatorio = hab && Math.abs(parseFloat(hab.costo_ambulatorio) - costoBase) < 0.01;

                let costo;
                if (esAmbulatorio) {
                    const salida  = detalle.salida ? new Date(detalle.salida) : new Date();
                    const ingreso = new Date(detalle.ingreso);
                    const diffHoras  = (salida - ingreso) / (1000 * 60 * 60);
                    const horasExtra = Math.max(0, Math.floor(diffHoras) - 6);
                    costo = costoBase + (horasExtra * 50);
                } else {
                    const dias = calcularDiasHabitacion(detalle.ingreso, detalle.salida);
                    costo = costoBase * dias;
                }

                if (detalle.tipo_habitacion === 'Intensivo') {
                    costoIntensivo += costo;
                } else {
                    costoTotal += costo;
                }
            }

            const fechaFormateada = expediente.fecha_ingreso_reciente
                ? `${expediente.fecha_ingreso_reciente}T${expediente.hora_ingreso_reciente || '00:00:00'}`
                : null;

            return res.status(200).json({
                nombremedico,
                numerohabitacion,
                fechaFormateada,
                costoTotal:     parseFloat(costoTotal.toFixed(2)),
                costoIntensivo: parseFloat(costoIntensivo.toFixed(2)),
                consumos:               consumos.map(i => ({ ...i.toJSON(), subtotal: parseFloat(i.subtotal || 0) || 0 })),
                consumosComunes:        consumosComunes.map(i => ({ ...i.toJSON(), total: parseFloat(i.total || 0) || 0 })),
                consumosMedicamentos:   consumosMedicamentos.map(i => ({ ...i.toJSON(), total: parseFloat(i.total || 0) || 0 })),
                consumosAnestesicos:    consumosAnestesicos.map(i => ({ ...i.toJSON(), total: parseFloat(i.total || 0) || 0 })),
                consumosQuirurgicos:    consumosQuirurgicos.map(i => ({ ...i.toJSON(), total: parseFloat(i.total || 0) || 0 })),
                examenes:               examenes.map(i => ({ ...i.toJSON(), total: parseFloat(i.total || 0) || 0 })),
                salaOperaciones:        salaOperaciones.map(i => ({ ...i.toJSON(), total: parseFloat(i.total || 0) || 0 })),
                honorarios:             honorarios.map(i => ({ ...i.toJSON(), total: parseFloat(i.total || 0) || 0 })),
            });

        } catch (error) {
            console.error('Error al obtener cuenta parcial:', error);
            return res.status(500).json({ msg: 'Error al obtener datos de cuenta parcial', error: error.message });
        }
    },
};

