'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const tiempo = require("../../utils/tiempo");
const Expediente = db.expedientes;
const Cuenta = db.cuentas;
const Habitaciones = db.habitaciones;
const Medicos = db.medicos
const Logs = db.log_traslados;
const DetalleCuentas = db.detalle_cuentas;
const Op = db.Sequelize.Op;
const DetalleHabitaciones = db.detalle_habitaciones;

const Honorario = db.detalle_honorarios
const Medico = db.medicos

const MovimientoComun = db.detalle_consumo_comunes;
const Comun = db.comunes;

const MovimientoMedicamentos = db.detalle_consumo_medicamentos;
const Medicamento = db.medicamentos;

const MovimientoQuirurgico = db.detalle_consumo_quirugicos;
const Quirurgico = db.quirurgicos;

const Consumo = db.consumos;
const Servicio = db.servicios;

const Examenes = db.examenes_realizados;
const ExamenAlmacenado = db.examenes_almacenados;
const Cuenta_Lab = db.lab_cuentas;

const SalaOperaciones = db.servicio_sala_operaciones;
const Categoria = db.categoria_sala_operaciones;

const DetalleHonorarios = db.detalle_honorarios;
const LogEliminacion = db.logs_eliminacion_pacientes;
const DetallePagoCuentas = db.detalle_pago_cuentas;
const RevisionConsumos = db.revision_consumos;

// Restaura al inventario las existencias de los consumos ACTIVOS (estado 1) de las
// cuentas indicadas y devuelve si habia consumos. La columna (farmacia/quirofano) se
// deduce de la descripcion, igual que el borrado individual de consumos. Solo repone
// productos inventariados; los medicamentos siempre descuentan, quirurgico/comun solo
// si su producto no es 'NO INVENTARIADO'. No borra las filas (eso lo hace el caller).
async function restaurarInventarioDeCuenta(idsCuentas, t) {
    const columnaDe = (descripcion) =>
        (descripcion || '').includes('Quirofano') ? 'existencia_actual_quirofano' : 'existencia_actual_farmacia';
    let huboConsumos = false;

    const [medicamentos, quirurgicos, comunes] = await Promise.all([
        MovimientoMedicamentos.findAll({ where: { id_cuenta: idsCuentas, estado: 1 }, transaction: t }),
        MovimientoQuirurgico.findAll({ where: { id_cuenta: idsCuentas, estado: 1 }, transaction: t }),
        MovimientoComun.findAll({ where: { id_cuenta: idsCuentas, estado: 1 }, transaction: t }),
    ]);

    if (medicamentos.length || quirurgicos.length || comunes.length) huboConsumos = true;

    for (const m of medicamentos) {
        if (!m.id_medicamento) continue;
        await Medicamento.increment(columnaDe(m.descripcion), { by: parseInt(m.cantidad), where: { id: m.id_medicamento }, transaction: t });
    }
    for (const q of quirurgicos) {
        if (!q.id_quirurgico) continue; // filas de paquete (id_quirurgico NULL) no descontaron existencia
        const prod = await Quirurgico.findByPk(q.id_quirurgico, { transaction: t });
        if (prod && prod.inventariado !== 'NO INVENTARIADO') {
            await Quirurgico.increment(columnaDe(q.descripcion), { by: parseInt(q.cantidad), where: { id: q.id_quirurgico }, transaction: t });
        }
    }
    for (const c of comunes) {
        if (!c.id_comun) continue;
        const prod = await Comun.findByPk(c.id_comun, { transaction: t });
        if (prod && prod.inventariado !== 'NO INVENTARIADO') {
            await Comun.increment(columnaDe(c.descripcion), { by: parseInt(c.cantidad), where: { id: c.id_comun }, transaction: t });
        }
    }
    return huboConsumos;
}

// ESTADOS ACTIVOS (paciente sigue en el hospital, no aplica para historial):
// 1 - hospitalizacion, 3 - quirofano, 4 - intensivo, 5 - emergencia
// 91, 93, 94, 95 - mismos anteriores con cuenta parcial por pagar
const ESTADOS_ACTIVOS_HISTORIAL = [1, 3, 4, 5, 91, 93, 94, 95];
async function clasificarHistorial(req, res, soloEmergencia) {
    const getPagingData = (data, page, limit) => {
        const { count: totalItems, rows: referido } = data;
        const currentPage = page ? +page : 0;
        const totalPages = Math.ceil(totalItems / limit);
        return { totalItems, referido, totalPages, currentPage };
    };

    const getPagination = (page, size) => {
        const limit = size ? +size : 10;
        const offset = page ? page * limit : 0;
        return { limit, offset };
    };

    const busqueda = req.query.search;
    const page = req.query.page - 1;
    const size = req.query.limit;
    const criterio = req.query.criterio;
    const order = req.query.order;
    const { limit, offset } = getPagination(page, size);

    try {
        const whereExpediente = busqueda
            ? { [Op.or]: [{ nombres: { [Op.like]: `%${busqueda}%` } }], estado: { [Op.notIn]: ESTADOS_ACTIVOS_HISTORIAL } }
            : { estado: { [Op.notIn]: ESTADOS_ACTIVOS_HISTORIAL } };

        // Traemos todos los expedientes históricos que cumplan la búsqueda
        const expedientesCandidatos = await Expediente.findAll({
            where: whereExpediente,
            attributes: ['id'],
        });

        const idsExpedientes = expedientesCandidatos.map(e => e.id);

        if (idsExpedientes.length === 0) {
            return res.send({ total: 0, last_page: 0, current_page: page + 1, from: 0, to: 0, data: [] });
        }

        // Cuentas de todos esos expedientes, junto a su detalle de habitaciones
        const cuentas = await Cuenta.findAll({
            where: { id_expediente: { [Op.in]: idsExpedientes } },
            attributes: ['id', 'id_expediente'],
        });

        const idsCuentas = cuentas.map(c => c.id);

        const detalles = await DetalleHabitaciones.findAll({
            where: { id_cuenta: { [Op.in]: idsCuentas } },
            attributes: ['id_cuenta', 'tipo_habitacion'],
        });

        // Mapear id_cuenta -> id_expediente
        const cuentaToExpediente = {};
        cuentas.forEach(c => { cuentaToExpediente[c.id] = c.id_expediente; });

        // Acumular, por expediente, si tiene habitaciones de Emergencia y/o de otro tipo
        const resumenPorExpediente = {};
        idsExpedientes.forEach(id => {
            resumenPorExpediente[id] = { totalHabitaciones: 0, soloEmergencia: true };
        });

        detalles.forEach(d => {
            const idExp = cuentaToExpediente[d.id_cuenta];
            if (idExp === undefined || !resumenPorExpediente[idExp]) return;
            resumenPorExpediente[idExp].totalHabitaciones += 1;
            if (d.tipo_habitacion !== 'Emergencia') {
                resumenPorExpediente[idExp].soloEmergencia = false;
            }
        });

        // Un expediente sin ningún registro de detalle_habitaciones se considera "otro caso" (no exclusivo de emergencia)
        const idsFiltrados = idsExpedientes.filter(id => {
            const resumen = resumenPorExpediente[id];
            const esSoloEmergencia = resumen.totalHabitaciones > 0 && resumen.soloEmergencia;
            return soloEmergencia ? esSoloEmergencia : !esSoloEmergencia;
        });

        const { count, rows } = await Expediente.findAndCountAll({
            where: { id: { [Op.in]: idsFiltrados } },
            include: [
                {
                    model: Medicos,
                    as: 'medico',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [[criterio || 'id', order || 'DESC']],
            limit,
            offset
        });

        const response = getPagingData({ count, rows }, page, limit);

        res.send({
            total: response.totalItems,
            last_page: response.totalPages,
            current_page: page + 1,
            from: response.currentPage,
            to: response.totalPages,
            data: response.referido
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
    }
}

module.exports = {
    create(req, res) {
        const restarHoras = (fecha, horas) => {
            let nuevaFecha = new Date(fecha);
            nuevaFecha.setHours(nuevaFecha.getHours() - horas);
            return nuevaFecha;
        };
        let form = req.body.form
        const today =restarHoras(new Date(), 6);
        let status = 0
        let lugar = ''
        if (form.selectedOption == 'hospi') {
            status = 1
            lugar = 'Hospitalización'
        } else if (form.selectedOption == 'emergencia') {
            status = 5
            lugar = 'Emergencia'
        } else if (form.selectedOption == 'quirofano') {
            status = 3
            lugar = 'Quirófano'
        } else if (form.selectedOption == 'intensivo') {
            status = 4
            lugar = 'Intensivos'
        }
        let datos = {
            nombres: form.nombre,
            apellidos: form.apellidos,
            expediente: 'EXPEDIENTE INCOMPLETO',
            nombre_factura: form.nombre_factura ?? null,
            nit_factura:    form.nit_factura    ?? null,
            primer_ingreso: today,
            casada: form.casada,
            nacimiento: form.nacimiento,
            cui: form.cui,
            nacionalidad: form.nacionalidad,
            telefono: form.telefono,
            direccion: form.direccion,
            genero: form.generos,
            nombre_encargado: form.nombre_encargado,
            contacto_encargado: form.contacto_encargado,
            cui_encargado: form.cui_encargado,
            parentesco_encargado: form.parentesco_encargado,
            edad_encargado: form.edad_encargado,
            estado: status,
            estado_civil: form.estado_civil,
            profesion: form.profesion,
            nombre_padre: form.nombre_padre,
            nombre_madre: form.nombre_madre,
            lugar_nacimiento: form.lugar_nacimiento,
            estado_civil_encargado: form.estado_civil_encargado,
            profesion_encargado: form.profesion_encargado,
            direccion_encargado: form.direccion_encargado,
            nombre_conyuge: form.nombre_conyuge,
            direccion_conyuge: form.direccion_conyuge,
            telefono_conyuge: form.telefono_conyuge,
            fecha_ingreso_reciente: restarHoras(new Date(), 6),
            created_by: req.user?.user ?? req.body.user,
        };

        if (form.selectedOption == 'emergencia') {
            datos.fecha_ingreso_reciente = form.fecha
            datos.hora_ingreso_reciente = form.hora
            datos.id_medico = form.assignedDoctor
        }

        Expediente.create(datos)
        .then(expediente => {
            const expediente_id = expediente.id
            let datos_cuenta = {
                numero: 1,
                fecha_ingreso: today,
                hora_ingreso: form.hora,
                motivo: form.motivo,
                descripcion: null,
                otros: null,
                total: 0.0,
                id_expediente: expediente_id,
                estado: 1,
                created_by: req.user?.user ?? req.body.user,
                descuento: 0.0,
                solicitud_descuento: 3
            }
            Cuenta.create(datos_cuenta)
                .then(res=>{
                    res.update({ numero: res.id });
                }) 
                .catch(err=>
                    console.log(err)
                )
            //Agregando log inicial de ingreso de paciente
            Logs.create({
                id_expediente: expediente_id,
                origen: 'Recién ingresado',
                destino: lugar,
                motivo: form.motivo,
                id_habitacionDestino : null,
                createdAt: new Date(),
                updatedAt: restarHoras(new Date(), 6),
                created_by: req.user?.user ?? req.body.user,
            })

            //Actualizar expediente
            const year = today.getFullYear();
            let resto
            var idFormateado = String(expediente_id).padStart(4, '0');
            resto = year + '-' + idFormateado
            Expediente.update(
                {
                    expediente: resto
                },
                { where: { 
                    id: expediente_id
                }}
            )
            res.send(expediente);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
                    
    },

    createEmergencia(req, res) {
        const restarHoras = (fecha, horas) => {
            let nuevaFecha = new Date(fecha);
            nuevaFecha.setHours(nuevaFecha.getHours() - horas);
            return nuevaFecha;
        };
        let form = req.body.form
        const today =restarHoras(new Date(), 6);
        let status = 0
        let lugar = ''
        if (form.selectedOption == 'hospi') {
            status = 1
            lugar = 'Hospitalización'
        } else if (form.selectedOption == 'emergencia') {
            status = 5
            lugar = 'Emergencia'
        } else if (form.selectedOption == 'quirofano') {
            status = 3
            lugar = 'Quirófano'
        } else if (form.selectedOption == 'intensivo') {
            status = 4
            lugar = 'Intensivos'
        }
        let datos = {
            nombres: form.nombre,
            apellidos: form.apellidos,
            expediente: 'EXPEDIENTE INCOMPLETO',
            primer_ingreso: today,
            casada: form.casada,
            nacimiento: form.nacimiento,
            cui: form.cui,
            nacionalidad: form.nacionalidad,
            telefono: form.telefono,
            direccion: form.direccion,
            genero: form.generos,
            nombre_encargado: form.nombre_encargado,
            contacto_encargado: form.contacto_encargado,
            cui_encargado: form.cui_encargado,
            parentesco_encargado: form.parentesco_encargado,
            edad_encargado: form.edad_encargado,
            estado: status,
            estado_civil: form.estado_civil,
            profesion: form.profesion,
            nombre_padre: form.nombre_padre,
            nombre_madre: form.nombre_madre,
            lugar_nacimiento: form.lugar_nacimiento,
            estado_civil_encargado: form.estado_civil_encargado,
            profesion_encargado: form.profesion_encargado,
            direccion_encargado: form.direccion_encargado,
            nombre_conyuge: form.nombre_conyuge,
            direccion_conyuge: form.direccion_conyuge,
            telefono_conyuge: form.telefono_conyuge,
            fecha_ingreso_reciente: restarHoras(new Date(), 6),
            created_by: req.user?.user ?? req.body.user,
            nombre_factura: form.nombre_factura ?? null,
            nit_factura:    form.nit_factura    ?? null,
        };

        if (form.selectedOption == 'emergencia') {
            datos.fecha_ingreso_reciente = form.fecha
            datos.hora_ingreso_reciente = form.hora
            datos.id_medico = form.assignedDoctor
        }

        Expediente.create(datos)
        .then(expediente => {
            const expediente_id = expediente.id
            let datos_cuenta = {
                numero: 1,
                fecha_ingreso: form.fecha,
                hora_ingreso: form.hora,
                motivo: form.motivo,
                descripcion: null,
                otros: null,
                total: 0.0,
                id_expediente: expediente_id,
                estado: 1,
                created_by: req.user?.user ?? req.body.user,
                descuento: 0.0,
                solicitud_descuento: 3
            }
            console.log('Aqui vamos bien')
            Cuenta.create(datos_cuenta)
            .then(cuenta => {
                cuenta.update({ numero: cuenta.id });

                DetalleHabitaciones.create({
                    id_cuenta: cuenta.id,
                    tipo_habitacion: "Emergencia",
                    estado: 1,
                    costo_base: 250.00,
                    ingreso: `${form.fecha}T${form.hora}`,
                    created_by: req.user?.user ?? req.body.user,
                });
            })
            .catch(err => console.log(err))
            //Agregando log inicial de ingreso de paciente
            Logs.create({
                id_expediente: expediente_id,
                origen: 'Recién ingresado',
                destino: lugar,
                motivo: form.motivo,
                id_habitacionDestino : null,
                createdAt: new Date(),
                updatedAt: restarHoras(new Date(), 6),
                created_by: req.user?.user ?? req.body.user,
            })

            //Actualizar expediente
            const year = today.getFullYear();
            let resto
            var idFormateado = String(expediente_id).padStart(4, '0');
            resto = year + '-' + idFormateado
            Expediente.update(
                {
                    expediente: resto
                },
                { where: { 
                    id: expediente_id
                }}
            )
            res.send(expediente);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
                    
    },

    async asignarHabitacion(req, res){
        const restarHoras = (fecha, horas) => {
            let nuevaFecha = new Date(fecha); // Crear una nueva instancia de fecha
            nuevaFecha.setHours(nuevaFecha.getHours() - horas);
            return nuevaFecha;
          };
        let form = req.body.form
        console.log(req.body)
        const habitacion = await Habitaciones.findOne({
            where: {
              id: form.habitacion
            }
          });
        let costo = 0
        const fechaString = form.fecha + " " + form.hora
        const fecha = new Date(fechaString);
        if (form.tipo_paciente === '1' || form.tipo_paciente === 1) {
            costo = habitacion.costo_ambulatorio
        } else if (form.tipo_paciente === '0' && form.estudioDeSueno === 0) {
            costo = habitacion.costo_diario
        } else if (form.tipo_paciente === '0' && (form.estudioDeSueno === '1' || form.estudioDeSueno === 1)) {
            costo = habitacion.costo_estudio_de_sueno
        } else if (form.tipo_paciente === '0' && (form.estudioDeSueno === '2' || form.estudioDeSueno === 2)) {
            costo = habitacion.costo_quimioterapia
        }  
        const createHabitacion = {
            id_cuenta: form.cuenta,
            tipo_habitacion: habitacion.tipo,
            id_habitacion: habitacion.id,
            estado: 1,
            costo_base: costo,
            ingreso: fecha,
            salida: null,
            createdAt: new Date(),
            updatedAt: restarHoras(new Date(), 6),
            created_by: req.user?.user ?? req.body.user
        }
        await DetalleHabitaciones.create(createHabitacion)
        await Habitaciones.update(
            {
                estado: 1,
                ocupante: null,
            },
            { where: { 
                ocupante: form.id
            }}
        )
        await Habitaciones.update(
            {
                estado: 2,
                ocupante: form.id,
            },
            { where: { 
                id: form.habitacion
            }}
        )
        Expediente.update(
        { 
            estado: 1,
            fecha_ingreso_reciente: form.fecha,
            hora_ingreso_reciente: form.hora,
        },
        { where: { 
            id: form.id
        } }).then(expediente => {
            console.log('HABITACION ', form.habitacion)
            res.send(expediente);
        }).catch(error => console.log(error))
    },

    createFromEnfermeria(req, res) {
        let form = req.body.form
        const today = new Date();
        let status = 0
        if (form.selectedOption == 'hospi') {
            status = 1
        } else if (form.selectedOption == 'emergencia') {
            status = 5
        } else if (form.selectedOption == 'quirofano') {
            status = 3
        } else if (form.selectedOption == 'intensivo') {
            status = 4
        }
        let datos = {
            nombres: 'PENDIENTE',
            apellidos: 'PENDIENTE',
            expediente: 'EXPEDIENTE INCOMPLETO',
            primer_ingreso: today,
            fecha_ingreso_reciente: form.fecha,
            hora_ingreso_reciente: form.hora,
            nacimiento: '0001-01-01',
            cui: 0,
            telefono: 'PENDIENTE',
            direccion: 'PENDIENTE',
            nombre_encargado: 'PENDIENTE',
            contacto_encargado: 'PENDIENTE',
            cui_encargado: 'PENDIENTE',
            direccion_encargado: 'PENDIENTE',
            estado: status,
            created_by: req.user?.user ?? req.body.user,
        };

        datos.id_medico = form.assignedDoctor

        Expediente.create(datos)
        .then(expediente => {
            const expediente_id = expediente.id
            let datos_cuenta = {
                numero: 1,
                fecha_ingreso: today,
                motivo: 'PENDIENTE',
                descripcion: null,
                otros: null,
                total: 0.0,
                id_expediente: expediente_id,
                estado: 1,
                created_by: req.user?.user ?? req.body.user,
                descuento: 0.0,
                solicitud_descuento: 3
            }
            Cuenta.create(datos_cuenta)
                .then(res=>{
                    res.update({ numero: res.id });
                }) 
                .catch(err=>
                    console.log(err)
                )
            Habitaciones.update(
                {
                    estado: 2,
                    ocupante: expediente_id
                },
                { where: { 
                    id: form.habitacion
                }}
            )
            //Actualizar expediente
            const year = today.getFullYear();
            let resto
            var idFormateado = String(expediente_id).padStart(4, '0');
            resto = year + '-' + idFormateado
            Expediente.update(
                {
                    expediente: resto
                },
                { where: { 
                    id: expediente_id
                }}
            )
            res.send(expediente);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
                    
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

        var condition = busqueda
        ? { 
            [Op.or]: [
                { nombres: { [Op.like]: `%${busqueda}%` }, estado: { [Sequelize.Op.gte]: 0, [Sequelize.Op.ne]: 11 } }
            ] 
            } 
        : { estado: { [Sequelize.Op.gte]: 0, [Sequelize.Op.ne]: 11 } };

        Expediente.findAndCountAll({
            include: [
                {
                    model: Medicos,
                    as: 'medico', // Usa el alias que definiste en la relación
                    attributes: ['id', 'nombre'] // Especifica solo los atributos necesarios
                },
                {
                    model: Habitaciones,
                    as: 'habitacione', // Usa el alias correcto
                    attributes: ['id', 'numero'] // Especifica solo los atributos necesarios
                }
            ],
            where: condition,
            order: [[criterio || 'id', order || 'ASC']], // Se asegura de que criterio y order existan
            limit,
            offset
        })
        .then(data => {
            console.log('data: ', JSON.stringify(data, null, 2));
            const response = getPagingData(data, page, limit);
        
            console.log('response: ', JSON.stringify(response, null, 2));
            res.send({
                total: response.totalItems,
                last_page: response.totalPages,
                current_page: page + 1,
                from: response.currentPage,
                to: response.totalPages,
                data: response.referido
            });
        })
        .catch(error => {
            console.error('Error en la consulta:', error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
        
    },

    listAsignar (req, res) {
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

        var condition = busqueda
        ? { 
            [Op.or]: [
                { nombres: { [Op.like]: `%${busqueda}%` }, estado: { [Sequelize.Op.in]: [1, 3, 4, 5, 10] } }
            ] 
            } 
        : { estado: { [Sequelize.Op.in]: [1, 3, 4, 5, 10] } };

        Expediente.findAndCountAll({
            include: [
                {
                    model: Medicos,
                    as: 'medico', // Usa el alias que definiste en la relación
                    attributes: ['id', 'nombre'] // Especifica solo los atributos necesarios
                },
                {
                    model: Habitaciones,
                    as: 'habitacione', // Usa el alias correcto
                    attributes: ['id', 'numero'] // Especifica solo los atributos necesarios
                },
                {
                    model: Cuenta,
                }
            ],
            where: condition,
            order: [[criterio || 'id', order || 'ASC']], // Se asegura de que criterio y order existan
            limit,
            offset
        })
        .then(data => {
            console.log('data: ', JSON.stringify(data, null, 2));
            const response = getPagingData(data, page, limit);
        
            console.log('response: ', JSON.stringify(response, null, 2));
            res.send({
                total: response.totalItems,
                last_page: response.totalPages,
                current_page: page + 1,
                from: response.currentPage,
                to: response.totalPages,
                data: response.referido
            });
        })
        .catch(error => {
            console.error('Error en la consulta:', error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
        
    },

    listPanel (req, res) {
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

        var condition = busqueda
        ? { 
            [Op.or]: [
                { 
                nombres: { [Op.like]: `%${busqueda}%` },
                estado: { [Sequelize.Op.in]: [1, 3, 4, 5, 10] }
                }
            ] 
            } 
        : { 
            estado: { [Sequelize.Op.in]: [1, 3, 4, 5, 10] } 
            };

        Expediente.findAndCountAll({
            include: [
                {
                    model: Medicos,
                    as: 'medico', // Usa el alias que definiste en la relación
                    attributes: ['id', 'nombre'] // Especifica solo los atributos necesarios
                },
                {
                    model: Habitaciones,
                    as: 'habitacione', // Usa el alias correcto
                    attributes: ['id', 'numero'] // Especifica solo los atributos necesarios
                },
                {
                    model: Cuenta,
                    as: 'cuentas', // Usa el alias que definiste en la relación
                    attributes: ['id', 'tipo'], // Especifica solo los atributos necesarios
                    separate: true,
                    limit: 1,
                    order: [['id', 'DESC']]
                }
            ],
            where: condition,
            order: [[criterio || 'id', order || 'ASC']], // Se asegura de que criterio y order existan
            limit,
            offset
        })
        .then(data => {
            console.log('data: ', JSON.stringify(data, null, 2));
            const response = getPagingData(data, page, limit);
        
            console.log('response: ', JSON.stringify(response, null, 2));
            res.send({
                total: response.totalItems,
                last_page: response.totalPages,
                current_page: page + 1,
                from: response.currentPage,
                to: response.totalPages,
                data: response.referido
            });
        })
        .catch(error => {
            console.error('Error en la consulta:', error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
        
    },

    find (req, res) {
        const id = req.params.id;

        return Expediente.findByPk(id)
        .then(marca => res.status(200).send(marca))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        const today = new Date();
        if(form.expediente==='EXPEDIENTE INCOMPLETO'){
            Expediente.findAndCountAll({
                where: {
                    cui: {
                        [Op.eq]: form.cui,
                    },
                    id: {
                        [Op.notLike]: form.id
                    }
                }
            })
            .then(result => {
                if(result.count >= 1){
                    Expediente.update(
                    { 
                        nombres: form.nombre,
                        apellidos: form.apellidos,
                        primer_ingreso: today,
                        casada: form.casada,
                        nacimiento: form.nacimiento,
                        cui: form.cui,
                        nacionalidad: form.nacionalidad,
                        telefono: form.telefono,
                        direccion: form.direccion,
                        genero: form.generos,
                        nombre_encargado: form.nombre_encargado,
                        contacto_encargado: form.contacto_encargado,
                        cui_encargado: form.cui_encargado,
                        parentesco_encargado: form.parentesco_encargado,
                        edad_encargado: form.edad_encargado,
                        estado_civil: form.estado_civil,
                        profesion: form.profesion,
                        nombre_padre: form.nombre_padre,
                        nombre_madre: form.nombre_madre,
                        lugar_nacimiento: form.lugar_nacimiento,
                        estado_civil_encargado: form.estado_civil_encargado,
                        profesion_encargado: form.profesion_encargado,
                        direccion_encargado: form.direccion_encargado,
                        nombre_conyuge: form.nombre_conyuge,
                        direccion_conyuge: form.direccion_conyuge,
                        telefono_conyuge: form.telefono_conyuge,
                        updated_by: req.user?.user ?? req.body.user,
                    },
                    { where: { 
                        id: result.rows[0].dataValues.id
                    } }).then(()=>{
                        Expediente.destroy({
                            where: {
                                id: form.id
                            }
                        }).then(res.send(form)).catch(error => console.log(error))
                        
                    }).catch(error => console.log(error))
                }
                else{
                    Expediente.update(
                    { 
                        nombres: form.nombre,
                        apellidos: form.apellidos,
                        expediente: form.expediente,
                        primer_ingreso: today,
                        casada: form.casada,
                        nacimiento: form.nacimiento,
                        cui: form.cui,
                        nacionalidad: form.nacionalidad,
                        telefono: form.telefono,
                        direccion: form.direccion,
                        genero: form.generos,
                        nombre_encargado: form.nombre_encargado,
                        contacto_encargado: form.contacto_encargado,
                        cui_encargado: form.cui_encargado,
                        parentesco_encargado: form.parentesco_encargado,
                        edad_encargado: form.edad_encargado,
                        estado: 1, 
                        estado_civil: form.estado_civil,
                        profesion: form.profesion,
                        nombre_padre: form.nombre_padre,
                        nombre_madre: form.nombre_madre,
                        lugar_nacimiento: form.lugar_nacimiento,
                        estado_civil_encargado: form.estado_civil_encargado,
                        profesion_encargado: form.profesion_encargado,
                        direccion_encargado: form.direccion_encargado,
                        nombre_conyuge: form.nombre_conyuge,
                        direccion_conyuge: form.direccion_conyuge,
                        telefono_conyuge: form.telefono_conyuge,
                        updated_by: req.user?.user ?? req.body.user,
                    },
                    { where: { 
                        id: form.id 
                    } }).then(()=>{
                        const year = today.getFullYear();
                        let resto
                        var idFormateado = String(form.id).padStart(4, '0');
                        resto = year + '-' + idFormateado
                        Expediente.update(
                            {
                                expediente: resto
                            },
                            { where: { 
                                id: form.id 
                            }}
                        ).then(()=>{
                            let datos_cuenta = {
                                numero: 1,
                                fecha_ingreso: today,
                                motivo: form.motivo,
                                descripcion: null,
                                otros: null,
                                total: 0.0,
                                id_expediente: form.id,
                                estado: 1,
                                created_by: req.user?.user ?? req.body.user,
                            }
                            Cuenta.create(datos_cuenta)
                            .then((resultCuenta_create)=>{
                                resultCuenta_create.update({ numero: resultCuenta_create.id });
                                res.send(form)
                            })
                            .catch(err=>
                                console.log(err)
                            )

                        }).catch(error => console.log(error))
                    }).catch(error => console.log(error))
                }
            })
            .catch(error => console.log(error))
        }
        else {
            Expediente.update(
            { 
                nombres: form.nombre,
                apellidos: form.apellidos,
                expediente: form.expediente,
                primer_ingreso: today,
                casada: form.casada,
                nacimiento: form.nacimiento,
                cui: form.cui,
                nacionalidad: form.nacionalidad,
                telefono: form.telefono,
                direccion: form.direccion,
                genero: form.generos,
                nombre_encargado: form.nombre_encargado,
                contacto_encargado: form.contacto_encargado,
                cui_encargado: form.cui_encargado,
                parentesco_encargado: form.parentesco_encargado,
                edad_encargado: form.edad_encargado,
                estado: 1, 
                estado_civil: form.estado_civil,
                profesion: form.profesion,
                nombre_padre: form.nombre_padre,
                nombre_madre: form.nombre_madre,
                lugar_nacimiento: form.lugar_nacimiento,
                estado_civil_encargado: form.estado_civil_encargado,
                profesion_encargado: form.profesion_encargado,
                direccion_encargado: form.direccion_encargado,
                nombre_conyuge: form.nombre_conyuge,
                direccion_conyuge: form.direccion_conyuge,
                telefono_conyuge: form.telefono_conyuge,
                nombre_factura: form.nombre_factura ?? null,
                nit_factura: form.nit_factura ?? null
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
        }
    },
    updateMedico (req, res) {
        Expediente.update(
            { id_medico: req.body.form.assignedDoctor },
            { where: { 
                expediente: req.body.form.expediente 
            } }
        )
        .then(marca => {
            res.status(200).send('Se ha asignado al médico correctamente')
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    activate (req, res) {
        Expediente.update(
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

    async changeState(req, res) {
        try {
            const form = req.body.form;

            const dat = [
                'egreso por fallecimiento',
                'Hospitalización',
                'Egreso por alta médica',
                'Quirófano',
                'Cuidados Intensivos',
                'Emergencias',
                'Desahuciado',
                'Alta médica',
                'Contraindicado',
                'Referido'
            ];

            const restarHoras = (fecha, horas) => {
                let nuevaFecha = new Date(fecha);
                nuevaFecha.setHours(nuevaFecha.getHours() - horas);
                return nuevaFecha;
            };

            const moment = require('moment');

            // 🔹 PROCESO DE COBRO
            if (req.body.estado)
            {
                const logs = await Logs.findAll({
                    where: {
                        id_expediente: req.body.id,
                        destino: dat[req.body.estado_anterior],
                    },
                    order: [['createdAt', 'DESC']],
                    limit: 1,
                });

                if (logs.length > 0) {
                    const registroMasReciente = logs[0];

                    let habitacionSeleccionada = null;

                    habitacionSeleccionada = await Habitaciones.findOne({
                        where: { ocupante: req.body.id },
                    });


                    const cuentas = await Cuenta.findAll({
                        where: { id_expediente: req.body.id, estado: 1 },
                        order: [['createdAt', 'DESC']],
                    });

                    if (cuentas.length === 0) {
                        return res.status(400).json({
                            msg: 'No se encontró ninguna cuenta activa'
                        });
                    }

                    const cuentaSeleccionada = cuentas[0];

                    const fechaHora1 = moment(registroMasReciente.createdAt);
                    const fechaHora2 = moment();

                    const horas = moment.duration(fechaHora2.diff(fechaHora1)).asHours();

                    let subtotal = 0;

                    if (horas <= 6) {
                        subtotal = parseFloat(habitacionSeleccionada.costo_ambulatorio);
                    } else {
                        const dias = Math.ceil(horas / 24);
                        subtotal = parseFloat(habitacionSeleccionada.costo_diario) * dias;
                    }

                    await DetalleCuentas.create({
                        id_cuenta: cuentaSeleccionada.id,
                        tipo: "Pago por servicio de habitación",
                        id_externo: parseInt(registroMasReciente.id_habitacionDestino),
                        subtotal
                    });

                    await cuentaSeleccionada.update({ total: subtotal });
                }
            }

            // 🔹 ACTUALIZAR CUENTA
            const cuentas = await Cuenta.findAll({
                where: { id_expediente: req.body.id, estado: 1 }
            });

            if (cuentas.length > 0) {
                await Cuenta.update({
                    pendiente_de_pago: cuentas[0].total - cuentas[0].total_pagado,
                    fecha_egreso: req.body.fecha || null,
                    hora_egreso: req.body.hora || null,
                }, {
                    where: { id: cuentas[0].id }
                });
            }

            if (typeof req.body.nombre_encargado === 'undefined') {
                await Expediente.update(
                    { estado: req.body.estado },
                    { where: { id: req.body.id } }
                );
            } else {
                await Expediente.update({
                    estado: req.body.estado,
                    nombre_encargado: req.body.nombre_encargado,
                    cui_encargado: req.body.cui_encargado,
                    contacto_encargado: req.body.contacto_encargado,
                    parentesco_encargado: req.body.parentesco_encargado,
                    edad_encargado: req.body.edad_encargado,
                    solvencia: 0
                }, {
                    where: { id: req.body.id }
                });
            }

            // ✅ UNA SOLA RESPUESTA
            return res.status(200).json({
                msg: 'Estado actualizado correctamente'
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                msg: 'Ha ocurrido un error, por favor intente más tarde'
            });
        }
    },

    deactivate (req, res) {
        Expediente.update(
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
    get (req, res) {
        Expediente.findAll({attributes: ['id', 'nombres', 'apellidos']})
        .then(data => {
            console.log(data)
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    getSearch (req, res) {
        var busqueda = req.query.search;
        var condition = busqueda?{ [Op.or]:[ {nombres: { [Op.like]: `%${busqueda}%` }}],[Op.and]:[{estado:1}] } : {estado:1} ;
        Expediente.findAll({
            where: condition})
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    getSearchExamenes(req, res) {
        const busqueda = req.query.search;
        const condition = busqueda ? { 
          nombres: { [Op.like]: `%${busqueda}%` } 
        } : null;
      
        Expediente.findAll({
          where: condition
        })
        .then(data => {
          res.send(data);
        })
        .catch(error => {
          console.error(error);
          return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
      },      

    async listQuirofano (req, res) {
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

        var condition = busqueda 
        ? { [Op.or]: [{ nombres: { [Op.like]: `%${busqueda}%` } }], estado: { [Op.in]: [3, 93] } } 
        : { estado: { [Op.in]: [3, 93] } };

        Expediente.findAndCountAll({
            include: [
                {
                    model: Medicos,
                    as: 'medico', // Usa el alias que definiste en la relación
                    attributes: ['id', 'nombre'] // Especifica solo los atributos necesarios
                },
                {
                    model: Habitaciones,
                    as: 'habitacione', // Usa el alias correcto
                    attributes: ['id', 'numero'] // Especifica solo los atributos necesarios
                },
                {
                    model: Cuenta,
                    required: true,
                    where: {
                        estado: { [Op.in]: [1, 10] }
                    }
                }
            ],
            where: condition,
            order: [[criterio || 'id', order || 'ASC']], // Se asegura de que criterio y order existan
            limit,
            offset
        })
        .then(data => {
            console.log('data: ', JSON.stringify(data, null, 2));
            const response = getPagingData(data, page, limit);
        
            console.log('response: ', JSON.stringify(response, null, 2));
            res.send({
                total: response.totalItems,
                last_page: response.totalPages,
                current_page: page + 1,
                from: response.currentPage,
                to: response.totalPages,
                data: response.referido
            });
        })
        .catch(error => {
            console.error('Error en la consulta:', error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    async listHospitalizacion(req, res) {
        try {
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

            const busqueda = req.query.search;
            const page = req.query.page - 1;
            const size = req.query.limit;
            const criterio = req.query.criterio;
            const order = req.query.order;

            const { limit, offset } = getPagination(page, size);

            const condition = busqueda
                ? {
                    [Op.or]: [{ nombres: { [Op.like]: `%${busqueda}%` } }],
                    estado: { [Op.in]: [1, 91] }
                }
                : { estado: { [Op.in]: [1, 91] } };

            const data = await Expediente.findAndCountAll({
                include: [
                    {
                        model: Medicos,
                        as: 'medico',
                        attributes: ['id', 'nombre'],
                        required: true
                    },
                    {
                        model: Habitaciones,
                        as: 'habitacione',
                        attributes: ['id', 'numero'],
                        required: true
                    },
                    {
                        model: Cuenta,
                        required: true,
                        where: {
                            estado: { [Op.in]: [1, 10] }
                        },
                        include: [
                            {
                                model: DetalleHonorarios,
                                as: 'detalle_honorarios',
                                attributes: ['id'],
                                required: false,
                                where: { estado: 1 }
                            }
                        ]
                    }
                ],
                where: condition,
                order: [[criterio || 'id', order || 'ASC']],
                limit,
                offset
            });

            const response = getPagingData(data, page, limit);

            return res.json({
                total: response.totalItems,
                last_page: response.totalPages,
                current_page: page + 1,
                from: response.currentPage,
                to: response.totalPages,
                data: response.referido
            });

        } catch (error) {
            console.error('Error en la consulta:', error);
            return res.status(400).json({
                msg: 'Ha ocurrido un error, por favor intente más tarde'
            });
        }
    },

    async listIntensivo (req, res) {
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

        var condition = busqueda 
        ? { [Op.or]: [{ nombres: { [Op.like]: `%${busqueda}%` } }], estado: { [Op.in]: [4, 94] } } 
        : { estado: { [Op.in]: [4, 94] } };

        Expediente.findAndCountAll({
            include: [
                {
                    model: Medicos,
                    as: 'medico', // Usa el alias que definiste en la relación
                    attributes: ['id', 'nombre'] // Especifica solo los atributos necesarios
                },
                {
                    model: Habitaciones,
                    as: 'habitacione', // Usa el alias correcto
                    attributes: ['id', 'numero'] // Especifica solo los atributos necesarios
                },
                {
                    model: Cuenta,
                    required: true,
                    where: {
                        estado: { [Op.in]: [1, 10] }
                    },
                    include: [
                        {
                            model: DetalleHonorarios,
                            as: 'detalle_honorarios',
                            attributes: ['id'],
                            required: false,
                            where: { estado: 1 }
                        }
                    ]
                }
            ],
            where: condition,
            order: [[criterio || 'id', order || 'ASC']], // Se asegura de que criterio y order existan
            limit,
            offset
        })
        .then(data => {
            console.log('data: ', JSON.stringify(data, null, 2));
            const response = getPagingData(data, page, limit);
        
            console.log('response: ', JSON.stringify(response, null, 2));
            res.send({
                total: response.totalItems,
                last_page: response.totalPages,
                current_page: page + 1,
                from: response.currentPage,
                to: response.totalPages,
                data: response.referido
            });
        })
        .catch(error => {
            console.error('Error en la consulta:', error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    async listEmergencia (req, res) {
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

        var condition = busqueda 
        ? { [Op.or]: [{ nombres: { [Op.like]: `%${busqueda}%` } }], estado: { [Op.in]: [5, 95] } } 
        : { estado: { [Op.in]: [5, 95] } };

        Expediente.findAndCountAll({
            include: [
                {
                    model: Medicos,
                    as: 'medico', // Asegúrate de que el alias coincida con la relación definida
                    attributes: ['id', 'nombre']
                },
                {
                    model: Habitaciones,
                    as: 'habitacione', // Asegúrate de que el alias coincida
                    attributes: ['id', 'numero']
                },
                {
                    model: Cuenta,
                    required: true,
                    where: {
                        estado: { [Op.in]: [1, 10] }
                    },
                    include: [
                        {
                            model: DetalleHonorarios,
                            as: 'detalle_honorarios',
                            attributes: ['id'],
                            required: false,
                            where: { estado: 1 }
                        }
                    ]
                }
            ],
            where: condition,
            order: [[criterio || 'id', order || 'ASC']], // Mejor manejo de parámetros
            limit,
            offset
        })
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
    
    async listReingreso (req, res) {
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

        var condition = busqueda ? { [Op.or]: [{ [criterio]: { [Op.like]: `%${busqueda}%` }, estado:{[Op.or]:[7,8,9]} }] } : {estado:{[Op.or]:[7,8,9]}} ;

        Expediente.findAndCountAll({ where: condition, order:[[`${criterio}`,`${order}`]],limit,offset})
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

    changeStatus (req, res) {
        let form = req.body.form
        let status = 0
        if (form.selectedOption == 'hospi') {
            status = 1
        } else if (form.selectedOption == 'emergencia') {
            status = 5
        } else if (form.selectedOption == 'quirofano') {
            status = 3
        } else if (form.selectedOption == 'intensivo') {
            status = 4
        }
        Expediente.update(
            { estado: status },
            { where: { 
                id: form.id 
            }}
        )
        .then(marca => {
            Cuenta.update(
                { estado: status },
                { where: { 
                    id: form.id 
                }}
            )
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    // Elimina permanentemente un expediente de emergencia (y todas sus cuentas).
    // Repone al inventario los consumos activos, borra todos los datos que dependen
    // de la cuenta y deja registro en logs_eliminacion_pacientes (quien, a quien y
    // a que hora). Se usa desde Emergencias.vue (solo cuando hay una sola cuenta).
    async delete (req, res) {
        const responsable = req.user?.user ?? req.body.user ?? null;
        const motivo = req.body.motivo ?? null;
        const t = await db.sequelize.transaction();
        try {
            const expediente = await Expediente.findByPk(req.body.id, {
                attributes: ['id', 'expediente', 'nombres', 'apellidos'],
                transaction: t,
            });

            const cuentas = await Cuenta.findAll({
                where: { id_expediente: req.body.id },
                attributes: ['id', 'tipo', 'total'],
                transaction: t,
            });
            const idsCuentas = cuentas.map(c => c.id);

            if (idsCuentas.length > 0) {
                // Reponer existencias de los consumos activos antes de borrarlos.
                const huboConsumos = await restaurarInventarioDeCuenta(idsCuentas, t);

                await Promise.all([
                    DetalleHabitaciones.destroy({ where: { id_cuenta: idsCuentas }, transaction: t }),
                    Consumo.destroy({ where: { id_cuenta: idsCuentas }, transaction: t }),
                    DetalleCuentas.destroy({ where: { id_cuenta: idsCuentas }, transaction: t }),
                    MovimientoComun.destroy({ where: { id_cuenta: idsCuentas }, transaction: t }),
                    MovimientoMedicamentos.destroy({ where: { id_cuenta: idsCuentas }, transaction: t }),
                    MovimientoQuirurgico.destroy({ where: { id_cuenta: idsCuentas }, transaction: t }),
                    DetalleHonorarios.destroy({ where: { id_cuenta: idsCuentas }, transaction: t }),
                    DetallePagoCuentas.destroy({ where: { id_cuenta: idsCuentas }, transaction: t }),
                    RevisionConsumos.destroy({ where: { id_cuenta: idsCuentas }, transaction: t }),
                ]);

                // Un registro de eliminacion por cada cuenta borrada. createdAt/updatedAt
                // los maneja Sequelize (UTC); el frontend los convierte a GT-6 al mostrar.
                const nombrePaciente = expediente ? `${expediente.nombres} ${expediente.apellidos}` : null;
                for (const c of cuentas) {
                    await LogEliminacion.create({
                        id_expediente: req.body.id,
                        id_cuenta: c.id,
                        numero_expediente: expediente ? expediente.expediente : null,
                        nombre_paciente: nombrePaciente,
                        tipo_cuenta: 2,
                        area: 'Emergencia', // este endpoint solo lo usa Emergencias.vue
                        motivo,
                        total_cuenta: c.total,
                        tenia_consumos: huboConsumos ? 1 : 0,
                        created_by: responsable,
                    }, { transaction: t });
                }
            }

            await Cuenta.destroy({ where: { id_expediente: req.body.id }, transaction: t });
            await Expediente.destroy({ where: { id: req.body.id }, transaction: t });

            await t.commit();
            return res.status(200).send('El registro ha sido eliminado');
        } catch (error) {
            await t.rollback();
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },

    async egresoNormal(req, res) {
        const form = req.body.form;

        // Construir fecha/hora de egreso como un solo Date
        function buildFechaEgreso(fecha, hora) {
            // Egreso del formulario en GMT-6, anclado a UTC (utils/tiempo).
            return tiempo.desdeFormulario(fecha, hora);
        }

        function calcularCostoHabitacion(detalle, fechaEgreso, habitacion) {
            // Ingreso y salida se interpretan anclados a UTC para que el calculo
            // no dependa de la zona horaria del proceso (ver utils/tiempo).
            const fechaIngreso = tiempo.desdeBD(detalle.ingreso);
            const salida       = new Date(fechaEgreso);

            const costoBase    = parseFloat(detalle.costo_base);
            const esAmbulatorio = habitacion &&
                parseFloat(habitacion.costo_ambulatorio) === costoBase;

            if (esAmbulatorio) {
                const diffMs    = salida - fechaIngreso;
                const diffHoras = diffMs / (1000 * 60 * 60);
                const horasExtra = Math.max(0, Math.floor(diffHoras) - 6);
                return costoBase + (horasExtra * 50);
            } else {
                const minutosIngreso = fechaIngreso.getUTCHours() * 60 + fechaIngreso.getUTCMinutes();
                const MIN_7AM = 7  * 60;
                const MIN_2PM = 14 * 60;

                let dias = 0;
                const primerCorte2PM = new Date(fechaIngreso);
                primerCorte2PM.setUTCHours(14, 0, 0, 0);

                if (minutosIngreso < MIN_7AM) {
                    dias += 1;
                } else if (minutosIngreso >= MIN_2PM) {
                    dias += 1;
                    primerCorte2PM.setUTCDate(primerCorte2PM.getUTCDate() + 1);
                }

                if (salida > primerCorte2PM) {
                    const diffMs   = salida - primerCorte2PM;
                    const periodos = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
                    dias += periodos;
                }

                return costoBase * Math.max(dias, 1);  // ← fix: mínimo 1 día
            }
        }

        const fechaEgreso = buildFechaEgreso(req.body.fecha, req.body.hora);

        const cuentas = await Cuenta.findAll({
            where: { id_expediente: req.body.id, estado: 1 },
            order: [['createdAt', 'DESC']],
        });

        if (cuentas.length > 0) {
            const id_cuenta = cuentas[0].id;

            // Todas las lab_cuentas activas de la admision actual (creadas desde el ultimo
            // ingreso), para no cobrar examenes de una admision anterior tras un reingreso.
            // Antes se tomaba solo la ultima (findOne), dejando sin cobrar los examenes
            // agendados en otros momentos de la misma hospitalizacion.
            const expedienteEgreso = await Expediente.findByPk(req.body.id, { attributes: ['fecha_ingreso_reciente'] });
            const desdeIngresoLab = expedienteEgreso ? expedienteEgreso.fecha_ingreso_reciente : null;
            const cuentasLabSeleccionadas = await Cuenta_Lab.findAll({
                where: {
                    id_expediente: req.body.id,
                    estado: 1,
                    ...(desdeIngresoLab ? { createdAt: { [Op.gte]: desdeIngresoLab } } : {}),
                },
            });
            const ids_cuenta_lab = cuentasLabSeleccionadas.map(c => c.id);

            // Obtener detalles de habitación incluyendo la habitación para saber el tipo de costo
            const detallesHabitacion = await DetalleHabitaciones.findAll({
                where: { id_cuenta, estado: 1 },
                attributes: ['id', 'tipo_habitacion', 'costo_base', 'ingreso', 'salida', 'id_habitacion'],
            });

            // Actualizar salida en cada detalle_habitacion
            await Promise.all(
                detallesHabitacion.map(d =>
                    d.update({ salida: fechaEgreso })
                )
            );

            // Cargar habitaciones relacionadas para saber si es ambulatorio
            const idsHabitacion = [...new Set(
                detallesHabitacion.map(d => d.id_habitacion).filter(Boolean)
            )];
            const habitacionesMap = {};
            if (idsHabitacion.length > 0) {
                const habitacionesData = await Habitaciones.findAll({
                    where: { id: idsHabitacion },
                    attributes: ['id', 'costo_ambulatorio', 'costo_diario'],
                });
                habitacionesData.forEach(h => { habitacionesMap[h.id] = h; });
            }

            const [
                consumos,
                consumosComunes,
                consumosMedicamentos,
                consumosAnestesicos,
                consumosQuirurgicos,
                examenes,
                salaOperaciones,
                honorarios,
            ] = await Promise.all([
                Consumo.findAll({ where: { id_cuenta }, attributes: ['subtotal'] }),
                MovimientoComun.findAll({ where: { id_cuenta, estado: 1 }, attributes: ['total'] }),
                MovimientoMedicamentos.findAll({
                    where: { id_cuenta, estado: 1 },
                    include: [{ model: Medicamento, attributes: [], where: { anestesico: { [Op.eq]: 1 } } }],
                    attributes: ['total'],
                }),
                MovimientoMedicamentos.findAll({
                    where: { id_cuenta, estado: 1 },
                    include: [{ model: Medicamento, attributes: [], where: { anestesico: { [Op.eq]: 0 } } }],
                    attributes: ['total'],
                }),
                MovimientoQuirurgico.findAll({ where: { id_cuenta, estado: 1 }, attributes: ['total'] }),
                ids_cuenta_lab.length > 0
                    ? Examenes.findAll({ where: { id_cuenta: { [Op.in]: ids_cuenta_lab } }, attributes: ['total'] })
                    : [],
                SalaOperaciones.findAll({ where: { id_cuenta }, attributes: ['total'] }),
                Honorario.findAll({ where: { id_cuenta, estado: 1 }, attributes: ['total'] }),
            ]);

            const sumar = (arr, campo) =>
                arr.reduce((acc, item) => acc + parseFloat(item[campo] || 0), 0);

            const costoHabitacion = detallesHabitacion.reduce((acc, detalle) => {
                const habitacion = habitacionesMap[detalle.id_habitacion] || null;
                return acc + calcularCostoHabitacion(detalle, fechaEgreso, habitacion);
            }, 0);

            const costoTotal =
                sumar(consumos,             'subtotal') +
                sumar(consumosComunes,      'total')    +
                sumar(consumosMedicamentos, 'total')    +
                sumar(consumosAnestesicos,  'total')    +
                sumar(consumosQuirurgicos,  'total')    +
                sumar(examenes,             'total')    +
                sumar(salaOperaciones,      'total')    +
                sumar(honorarios,           'total')    +
                costoHabitacion;

            await Cuenta.update({
                total: costoTotal,
                pendiente_de_pago: costoTotal,
                fecha_egreso: req.body.fecha || null,
                hora_egreso:  req.body.hora  || null,
            }, {
                where: { id: id_cuenta }
            });
        }

        await Expediente.update({
            estado:    req.body.estado,
            solvencia: 0
        }, {
            where: { id: req.body.id }
        });

        return res.status(200).json({ msg: 'Estado actualizado correctamente' });
    },

    async reingresoNormal(req, res) {
        try {
            const restarHoras = (fecha, horas) => {
                let nuevaFecha = new Date(fecha);
                nuevaFecha.setHours(nuevaFecha.getHours() - horas);
                return nuevaFecha;
            };

            const today = restarHoras(new Date(), 6);
            const id_expediente = req.body.id;

            // Fecha/hora del reingreso: si vienen del formulario (reingreso con
            // asignacion de habitacion) se usan; si no, la hora GT-6 del servidor
            // (Guatemala no observa horario de verano).
            let fechaIngreso, horaIngreso;
            if (req.body.fecha && req.body.hora) {
                fechaIngreso = req.body.fecha;
                horaIngreso = req.body.hora;
            } else {
                const gt = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guatemala' }));
                const pad = (n) => String(n).padStart(2, '0');
                fechaIngreso = `${gt.getFullYear()}-${pad(gt.getMonth() + 1)}-${pad(gt.getDate())}`;
                horaIngreso = `${pad(gt.getHours())}:${pad(gt.getMinutes())}:${pad(gt.getSeconds())}`;
            }

            // Reactivar expediente y actualizar la fecha/hora de ingreso reciente
            await Expediente.update(
                { estado: 1, solvencia: 0, fecha_ingreso_reciente: fechaIngreso, hora_ingreso_reciente: horaIngreso },
                { where: { id: id_expediente } }
            );

            // Obtener la última cuenta (la que ya existe) y actualizar su fecha/hora
            // de ingreso al momento del reingreso.
            const cuenta = await Cuenta.findOne({
                where: { id_expediente },
                order: [['createdAt', 'DESC']],
            });
            if (cuenta) {
                await cuenta.update({ fecha_ingreso: fechaIngreso, hora_ingreso: horaIngreso });
            }

            // Buscar la habitación que tenía este paciente
            const habitacion = await Habitaciones.findOne({
                where: { ocupante_previo: id_expediente }
            });

            if (habitacion) {

                // Reasignar la habitación al paciente y limpiar ocupante_previo
                await Habitaciones.update(
                    { estado: 2, ocupante: id_expediente, ocupante_previo: null },
                    { where: { id: habitacion.id } }
                );
            }

            // Log del reingreso
            await Logs.create({
                id_expediente,
                origen: 'Egresado',
                destino: 'Hospitalización',
                motivo: 'Reingreso',
                id_habitacionDestino: habitacion ? habitacion.id : null,
                createdAt: new Date(),
                updatedAt: today,
                created_by: req.user?.user ?? req.body.user,
            });

            return res.status(200).json({ msg: 'El paciente ha sido reingresado correctamente' });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error al reingresar al paciente' });
        }
    },

    // Reingreso desde el modulo de Reingresos (paciente egresado que ya pago en caja).
    // A diferencia de reingresoNormal, aqui NO hay cuenta previa a la cual apuntar:
    // se CREA una cuenta nueva. Ademas reactiva el expediente al area elegida, crea
    // el detalle de habitacion (cuarto) y asigna el medico. Todo en una transaccion.
    async reingresoConAsignacion(req, res) {
        const restarHoras = (fecha, horas) => {
            const nueva = new Date(fecha);
            nueva.setHours(nueva.getHours() - horas);
            return nueva;
        };
        const form = req.body.form || {};
        const id_expediente = form.id;
        const responsable = req.user?.user ?? form.user;
        // Area -> estado del expediente (mismo criterio que createFromEnfermeria).
        const estadoArea = { hospi: 1, quirofano: 3, intensivo: 4 }[form.selectedOption] || 1;

        if (!id_expediente || !form.habitacion || !form.fecha || !form.hora || !form.assignedDoctor) {
            return res.status(400).json({ msg: 'Datos incompletos: se requiere habitacion, fecha, hora y medico' });
        }

        const t = await db.sequelize.transaction();
        try {
            const habitacion = await Habitaciones.findOne({ where: { id: form.habitacion }, transaction: t });
            if (!habitacion) {
                await t.rollback();
                return res.status(400).json({ msg: 'La habitacion seleccionada no existe' });
            }

            // 1) Reactivar el expediente al area, con la fecha/hora de ingreso y el medico.
            await Expediente.update({
                estado: estadoArea,
                solvencia: 0,
                fecha_ingreso_reciente: form.fecha,
                hora_ingreso_reciente: form.hora,
                id_medico: form.assignedDoctor
            }, { where: { id: id_expediente }, transaction: t });

            // 2) Crear una cuenta NUEVA (no se reutiliza la anterior).
            const nuevaCuenta = await Cuenta.create({
                numero: 1,
                fecha_ingreso: form.fecha,
                hora_ingreso: form.hora,
                motivo: form.motivo || 'Reingreso',
                descripcion: null,
                otros: null,
                total: 0.0,
                id_expediente: id_expediente,
                estado: 1,
                descuento: 0.0,
                solicitud_descuento: 3,
                created_by: responsable
            }, { transaction: t });
            await nuevaCuenta.update({ numero: nuevaCuenta.id }, { transaction: t });

            // 3) Detalle de habitacion (cuarto) sobre la cuenta nueva.
            //    Costo segun tipo de paciente / estudio (igual que asignarHabitacion).
            let costo = habitacion.costo_diario;
            if (form.tipo_paciente === '1' || form.tipo_paciente === 1) {
                costo = habitacion.costo_ambulatorio;
            } else if (form.estudioDeSueno === '1' || form.estudioDeSueno === 1) {
                costo = habitacion.costo_estudio_de_sueno;
            } else if (form.estudioDeSueno === '2' || form.estudioDeSueno === 2) {
                costo = habitacion.costo_quimioterapia;
            }
            await DetalleHabitaciones.create({
                id_cuenta: nuevaCuenta.id,
                tipo_habitacion: habitacion.tipo,
                id_habitacion: habitacion.id,
                estado: 1,
                costo_base: costo,
                ingreso: new Date(form.fecha + ' ' + form.hora),
                salida: null,
                createdAt: new Date(),
                updatedAt: restarHoras(new Date(), 6),
                created_by: responsable
            }, { transaction: t });

            // 4) Liberar el cuarto anterior de este paciente y ocupar el nuevo.
            await Habitaciones.update({ estado: 1, ocupante: null }, { where: { ocupante: id_expediente }, transaction: t });
            await Habitaciones.update({ estado: 2, ocupante: id_expediente }, { where: { id: form.habitacion }, transaction: t });

            // 5) Log del reingreso.
            const destino = { hospi: 'Hospitalización', quirofano: 'Quirófano', intensivo: 'Cuidados Intensivos' }[form.selectedOption] || 'Hospitalización';
            await Logs.create({
                id_expediente,
                origen: 'Egresado',
                destino,
                motivo: 'Reingreso',
                id_habitacionDestino: form.habitacion,
                createdAt: new Date(),
                updatedAt: restarHoras(new Date(), 6),
                created_by: responsable
            }, { transaction: t });

            await t.commit();
            return res.status(200).json({ msg: 'El paciente ha sido reingresado correctamente', id_cuenta: nuevaCuenta.id });
        } catch (error) {
            await t.rollback();
            console.error(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error al reingresar al paciente' });
        }
    },

    async egresoEmergencia(req, res) {
        const { id, fecha, hora, user } = req.body;
        const { motivo, diagnostico, tratamiento, observaciones } = req.body.egreso;
 
        try {
            // 1. Obtener la cuenta activa del expediente
            const cuenta = await Cuenta.findOne({
                where: { id_expediente: id, estado: 1 },
                order: [['createdAt', 'DESC']],
            });
 
            if (!cuenta) {
                return res.status(404).json({ msg: 'No se encontró cuenta activa para este expediente' });
            }
 
            const id_cuenta = cuenta.id;
 
            // 2. Obtener TODAS las cuentas de lab activas de la admision actual (creadas
            //    desde el ultimo ingreso), para no cobrar lab de una previa pero sin dejar
            //    fuera examenes agendados en otros momentos de esta misma admision.
            const expedienteEmerg = await Expediente.findByPk(id, { attributes: ['fecha_ingreso_reciente'] });
            const desdeIngresoLabE = expedienteEmerg ? expedienteEmerg.fecha_ingreso_reciente : null;
            const cuentasLabEmerg = await Cuenta_Lab.findAll({
                where: {
                    id_expediente: id,
                    estado: 1,
                    ...(desdeIngresoLabE ? { createdAt: { [Op.gte]: desdeIngresoLabE } } : {}),
                },
            });
            const ids_cuenta_lab = cuentasLabEmerg.map(c => c.id);
 
            // 3. Calcular costo de habitación tipo Emergencia: costo_base + Q25 por hora extra (luego de 2 horas)
            const detallesHabitacion = await DetalleHabitaciones.findAll({
                where: { id_cuenta, estado: 1 },
                attributes: ['tipo_habitacion', 'costo_base', 'ingreso', 'salida'],
            });
 
            let costoEmergencia = 0;
            const salidaDatetime = tiempo.desdeFormulario(fecha, hora);

            for (const detalle of detallesHabitacion) {
                if (detalle.tipo_habitacion === 'Emergencia') {
                    const fechaIngreso = tiempo.desdeBD(detalle.ingreso);
                    const fechaSalida  = detalle.salida ? tiempo.desdeBD(detalle.salida) : salidaDatetime;
 
                    const diffMs       = fechaSalida - fechaIngreso;
                    const horasTotales = diffMs / (1000 * 60 * 60);
                    const horasExtra   = Math.floor(Math.max(horasTotales - 2, 0));
 
                    costoEmergencia += parseFloat(detalle.costo_base) + (horasExtra * 25);
                }
            }
 
            // 4. Recolectar todos los consumos en paralelo
            const [
                consumos,
                consumosComunes,
                consumosMedicamentos,
                consumosAnestesicos,
                consumosQuirurgicos,
                examenes,
                honorarios,
            ] = await Promise.all([
                Consumo.findAll({ where: { id_cuenta }, attributes: ['subtotal'] }),
                MovimientoComun.findAll({ where: { id_cuenta, estado: 1 }, attributes: ['total'] }),
                MovimientoMedicamentos.findAll({
                    where: { id_cuenta, estado: 1 },
                    include: [{ model: Medicamento, attributes: [], where: { anestesico: { [Op.eq]: 1 } }, required: true }],
                    attributes: ['total'],
                }),
                MovimientoMedicamentos.findAll({
                    where: { id_cuenta, estado: 1 },
                    include: [{ model: Medicamento, attributes: [], where: { anestesico: { [Op.eq]: 0 } }, required: true }],
                    attributes: ['total'],
                }),
                MovimientoQuirurgico.findAll({ where: { id_cuenta, estado: 1 }, attributes: ['total'] }),
                ids_cuenta_lab.length > 0
                    ? Examenes.findAll({ where: { id_cuenta: { [Op.in]: ids_cuenta_lab } }, attributes: ['total'] })
                    : [],
                Honorario.findAll({ where: { id_cuenta, estado: 1 }, attributes: ['total'] }),
            ]);
 
            const sumar = (arr, campo) =>
                arr.reduce((acc, item) => {
                    const val = parseFloat(item[campo]);
                    return acc + (isNaN(val) ? 0 : val);
                }, 0);
 
            const costoTotal =
                costoEmergencia                         +
                sumar(consumos,             'subtotal') +
                sumar(consumosComunes,      'total')    +
                sumar(consumosMedicamentos, 'total')    +
                sumar(consumosAnestesicos,  'total')    +
                sumar(consumosQuirurgicos,  'total')    +
                sumar(examenes,             'total')    +
                sumar(honorarios,           'total');
 
            // 5. Actualizar Cuenta: totales + campos clínicos del egreso + fecha/hora de salida
            await Cuenta.update({
                total:             costoTotal,
                pendiente_de_pago: costoTotal,
                fecha_egreso:      fecha ?? null,
                hora_egreso:       hora  ?? null,
                motivo:            motivo        ?? cuenta.motivo,
                descripcion:       diagnostico   ?? cuenta.descripcion,
                otros:             tratamiento   ?? cuenta.otros,
                motivo_egreso:     observaciones ?? cuenta.motivo_egreso,
                updated_by:        user,
            }, {
                where: { id: id_cuenta }
            });
 
            // 6. Registrar salida en detalle_habitaciones si aún no tiene
            await DetalleHabitaciones.update(
                { salida: salidaDatetime, updated_by: user },
                { where: { id_cuenta, estado: 1, salida: null } }
            );
 
            // 7. Actualizar Expediente: estado 7 (alta médica) y solvencia 0
            await Expediente.update({
                estado:     7,
                solvencia:  0,
                updated_by: user,
            }, {
                where: { id }
            });
 
            return res.status(200).json({ msg: 'Egreso de emergencia registrado correctamente' });
 
        } catch (error) {
            console.error('Error en egresoEmergencia:', error);
            return res.status(500).json({ msg: 'Error al procesar el egreso de emergencia', error: error.message });
        }
    },

    async listEmergenciaHistorial(req, res) {
        return clasificarHistorial(req, res, true);
    },

    async listPacientesHistorial(req, res) {
        return clasificarHistorial(req, res, false);
    },

    async listPacientesActivos(req, res) {
        const getPagingData = (data, page, limit) => {
            const { count: totalItems, rows: referido } = data;
            const currentPage = page ? +page : 0;
            const totalPages = Math.ceil(totalItems / limit);
            return { totalItems, referido, totalPages, currentPage };
        };

        const getPagination = (page, size) => {
            const limit = size ? +size : 10;
            const offset = page ? page * limit : 0;
            return { limit, offset };
        };

        const busqueda = req.query.search;
        const page = req.query.page - 1;
        const size = req.query.limit;
        const criterio = req.query.criterio;
        const order = req.query.order;
        const { limit, offset } = getPagination(page, size);

        try {
            const whereExpediente = busqueda
                ? { [Op.or]: [{ nombres: { [Op.like]: `%${busqueda}%` } }], estado: { [Op.in]: ESTADOS_ACTIVOS_HISTORIAL } }
                : { estado: { [Op.in]: ESTADOS_ACTIVOS_HISTORIAL } };

            const { count, rows } = await Expediente.findAndCountAll({
                where: whereExpediente,
                include: [
                    {
                        model: Medicos,
                        as: 'medico',
                        attributes: ['id', 'nombre']
                    }
                ],
                order: [[criterio || 'id', order || 'DESC']],
                limit,
                offset
            });

            const response = getPagingData({ count, rows }, page, limit);

            res.send({
                total: response.totalItems,
                last_page: response.totalPages,
                current_page: page + 1,
                from: response.currentPage,
                to: response.totalPages,
                data: response.referido
            });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },

    async getCuentasExpediente(req, res) {
        const { id } = req.params; // id_expediente

        try {
            const cuentas = await Cuenta.findAll({
                where: { id_expediente: id },
                attributes: ['id', 'numero', 'tipo', 'fecha_ingreso', 'fecha_egreso', 'estado'],
                order: [['createdAt', 'ASC']],
            });

            const cuentasLab = await Cuenta_Lab.findAll({
                where: { id_expediente: id },
                attributes: ['id', 'numero', 'estado'],
                order: [['createdAt', 'ASC']],
            });

            return res.status(200).json({ cuentas, cuentasLab });
        } catch (error) {
            console.error('Error al obtener las cuentas del expediente:', error);
            return res.status(500).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },

    // SOLO GERENCIA (rol 1). Corrige la fecha/hora de ingreso ACTUAL de un paciente
    // (para casos de error de digitacion). Actualiza los tres lugares que la usan:
    // expediente (fecha/hora_ingreso_reciente), la cuenta activa (fecha/hora_ingreso)
    // y el detalle de habitacion activo (ingreso), para que el cobro de habitacion
    // siga siendo consistente.
    async editarIngresoActual(req, res) {
        const { id_expediente, fecha, hora, user, user_type } = req.body;
        if (parseInt(user_type) !== 1) {
            return res.status(403).json({ msg: 'Solo gerencia puede editar la fecha de ingreso' });
        }
        if (!id_expediente || !fecha || !hora) {
            return res.status(400).json({ msg: 'Datos incompletos: se requiere expediente, fecha y hora' });
        }

        const t = await db.sequelize.transaction();
        try {
            const cuenta = await Cuenta.findOne({
                where: { id_expediente },
                order: [['createdAt', 'DESC']],
                transaction: t,
            });
            if (!cuenta) {
                await t.rollback();
                return res.status(404).json({ msg: 'No se encontró una cuenta para este paciente' });
            }

            await Expediente.update(
                { fecha_ingreso_reciente: fecha, hora_ingreso_reciente: hora, updated_by: user },
                { where: { id: id_expediente }, transaction: t }
            );

            await cuenta.update({ fecha_ingreso: fecha, hora_ingreso: hora, updated_by: user }, { transaction: t });

            // Detalle de habitacion activo (mismo formato que reingreso/asignacion).
            await DetalleHabitaciones.update(
                { ingreso: new Date(fecha + ' ' + hora), updated_by: user },
                { where: { id_cuenta: cuenta.id, estado: 1, salida: null }, transaction: t }
            );

            await t.commit();
            return res.status(200).json({ msg: 'La fecha y hora de ingreso se actualizaron correctamente' });
        } catch (error) {
            await t.rollback();
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },

    // SOLO GERENCIA (rol 1). Elimina el reingreso/hospitalizacion ACTUAL de un
    // paciente (caso de error, ej. hora de ingreso mal registrada): saca al paciente
    // del hospital sin cobrar nada. Repone al inventario los consumos activos, borra
    // todos los datos que dependen de la cuenta, libera la habitacion, deja el
    // expediente como egresado y registra la eliminacion en logs_eliminacion_pacientes.
    async eliminarCuentaActual(req, res) {
        const { id_expediente, user, user_type, motivo } = req.body;
        if (parseInt(user_type) !== 1) {
            return res.status(403).json({ msg: 'Solo gerencia puede eliminar la cuenta actual' });
        }
        if (!id_expediente) {
            return res.status(400).json({ msg: 'Datos incompletos: se requiere expediente' });
        }

        const t = await db.sequelize.transaction();
        try {
            const cuenta = await Cuenta.findOne({
                where: { id_expediente },
                order: [['createdAt', 'DESC']],
                transaction: t,
            });
            if (!cuenta) {
                await t.rollback();
                return res.status(404).json({ msg: 'No se encontró una cuenta activa para este paciente' });
            }

            const expediente = await Expediente.findByPk(id_expediente, {
                attributes: ['id', 'expediente', 'nombres', 'apellidos', 'estado'],
                transaction: t,
            });
            // El area del paciente se determina por expediente.estado (cuenta.tipo no se
            // usa en el sistema y siempre queda en 1). Hospitalizacion = 1 / 91.
            if (!expediente || ![1, 91].includes(expediente.estado)) {
                await t.rollback();
                return res.status(400).json({ msg: 'El paciente no está actualmente hospitalizado' });
            }

            const idsCuentas = [cuenta.id];
            const huboConsumos = await restaurarInventarioDeCuenta(idsCuentas, t);

            await Promise.all([
                DetalleHabitaciones.destroy({ where: { id_cuenta: idsCuentas }, transaction: t }),
                Consumo.destroy({ where: { id_cuenta: idsCuentas }, transaction: t }),
                DetalleCuentas.destroy({ where: { id_cuenta: idsCuentas }, transaction: t }),
                MovimientoComun.destroy({ where: { id_cuenta: idsCuentas }, transaction: t }),
                MovimientoMedicamentos.destroy({ where: { id_cuenta: idsCuentas }, transaction: t }),
                MovimientoQuirurgico.destroy({ where: { id_cuenta: idsCuentas }, transaction: t }),
                DetalleHonorarios.destroy({ where: { id_cuenta: idsCuentas }, transaction: t }),
                DetallePagoCuentas.destroy({ where: { id_cuenta: idsCuentas }, transaction: t }),
                RevisionConsumos.destroy({ where: { id_cuenta: idsCuentas }, transaction: t }),
            ]);

            await cuenta.destroy({ transaction: t });

            // Liberar la habitacion que ocupaba el paciente (mismo patron que el egreso).
            await Habitaciones.update(
                { estado: 1, ocupante: null, ocupante_previo: id_expediente },
                { where: { ocupante: id_expediente }, transaction: t }
            );

            // Dejar el expediente como egresado (egreso normal = 7).
            await Expediente.update(
                { estado: 7, solvencia: 0, updated_by: user },
                { where: { id: id_expediente }, transaction: t }
            );

            // createdAt/updatedAt los maneja Sequelize (UTC); el frontend los convierte a GT-6.
            await LogEliminacion.create({
                id_expediente,
                id_cuenta: cuenta.id,
                numero_expediente: expediente ? expediente.expediente : null,
                nombre_paciente: `${expediente.nombres} ${expediente.apellidos}`,
                tipo_cuenta: 1,
                area: 'Hospitalización',
                motivo: motivo ?? null,
                total_cuenta: cuenta.total,
                tenia_consumos: huboConsumos ? 1 : 0,
                created_by: user,
            }, { transaction: t });

            await t.commit();
            return res.status(200).json({ msg: 'La cuenta actual del paciente ha sido eliminada correctamente' });
        } catch (error) {
            await t.rollback();
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },

    // Listado paginado (vuetable) de las eliminaciones de cuentas de pacientes, para
    // la pestaña "Historial eliminaciones" del panel de gerencia.
    async listEliminaciones(req, res) {
        const getPagingData = (data, page, limit) => {
            const { count: totalItems, rows: referido } = data;
            const currentPage = page ? +page : 0;
            const totalPages = Math.ceil(totalItems / limit);
            return { totalItems, referido, totalPages, currentPage };
        };
        const getPagination = (page, size) => {
            const limit = size ? +size : 10;
            const offset = page ? page * limit : 0;
            return { limit, offset };
        };

        const busqueda = req.query.search;
        const page = req.query.page - 1;
        const size = req.query.limit;
        const criterio = req.query.criterio;
        const order = req.query.order;
        const { limit, offset } = getPagination(page, size);

        const condition = busqueda
            ? { [Op.or]: [
                { nombre_paciente: { [Op.like]: `%${busqueda}%` } },
                { numero_expediente: { [Op.like]: `%${busqueda}%` } },
                { created_by: { [Op.like]: `%${busqueda}%` } },
                { area: { [Op.like]: `%${busqueda}%` } },
            ] }
            : {};

        try {
            const data = await LogEliminacion.findAndCountAll({
                where: condition,
                order: [[criterio || 'createdAt', order || 'DESC']],
                limit,
                offset,
            });
            const response = getPagingData(data, page, limit);
            return res.send({
                total: response.totalItems,
                last_page: response.totalPages,
                current_page: page + 1,
                from: response.currentPage,
                to: response.totalPages,
                data: response.referido,
            });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    }
};

