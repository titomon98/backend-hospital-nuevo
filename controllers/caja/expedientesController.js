'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Expediente = db.expedientes;
const Cuenta = db.cuentas;
const Habitaciones = db.habitaciones;
const Medicos = db.medicos
const Logs = db.log_traslados;
const DetalleCuentas = db.detalle_cuentas;
const Op = db.Sequelize.Op;

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
        const datos = {
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
            created_by: req.body.user,
        };

        Expediente.create(datos)
        .then(expediente => {
            const expediente_id = expediente.id
            let datos_cuenta = {
                numero: 1,
                fecha_ingreso: today,
                motivo: form.motivo,
                descripcion: null,
                otros: null,
                total: 0.0,
                id_expediente: expediente_id,
                estado: 1,
                created_by: req.body.user,
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
                createdAt: restarHoras(new Date(), 6),
                updatedAt: restarHoras(new Date(), 6),
                created_by: req.body.user,
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

    asignarHabitacion(req, res){
        let form = req.body.form
        console.log(form)

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
            Habitaciones.update(
                {
                    estado: 2,
                    ocupante: form.id,
                },
                { where: { 
                    id: form.habitacion
                }}
            )
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
        const datos = {
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
            estado: 10,
            created_by: req.body.user,
        };

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
                created_by: req.body.user,
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
                },
                { where: { 
                    id: form.habitacion.id
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
                        updated_by: req.body.user,
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
                        updated_by: req.body.user,
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
                                created_by: req.body.user,
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
                telefono_conyuge: form.telefono_conyuge
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
        console.log(req.body.form)
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
    changeState (req, res) {
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
        ]
        const restarHoras = (fecha, horas) => {
            let nuevaFecha = new Date(fecha);
            nuevaFecha.setHours(nuevaFecha.getHours() - horas);
            return nuevaFecha;
          };
        console.log('DATATAOOOOOO---------------------------' + req.body.habitaciones + 'MAS DATOS COMPLETOPS------------------------')
        Logs.create({
            id_expediente: req.body.id,
            origen: dat[req.body.estado_anterior],
            destino: dat[req.body.estado],
            motivo: dat[req.body.motivo],
            id_habitacionDestino : parseInt(req.body.habitaciones),
            createdAt: restarHoras(new Date(), 6),
            updatedAt: restarHoras(new Date(), 6),
            created_by: req.body.user,
        })

        const moment = require('moment');
        if (dat[req.body.estado] === 'Alta médica' || dat[req.body.estado] === 'egreso por fallecimiento' || dat[req.body.estado] === 'Contraindicado' || dat[req.body.estado] === 'Referido' || dat[req.body.estado] === 'Desahuciado') {
          console.log('-----------------------------------------------------------------------------INGRESO PARA COBRAR---------------------------------------------');
        
          Logs.findAll({
            where: {
              id_expediente: req.body.id,
              destino: dat[req.body.estado_anterior],
            },
            order: [['createdAt', 'DESC']],
            limit: 1,
          })
          .then(async logs => {
            if (logs.length > 0) {
              const registroMasReciente = logs[0];
        

                // SELECCIONAR HABITACIÓN
                let habitacionSeleccionada = 0
                if (registroMasReciente.id_habitacionDestino) {
                    habitacionSeleccionada = await Habitaciones.findOne({

                        where: { id: registroMasReciente.id_habitacionDestino },
                      });
                }
                
        console.log("----------------------------------------HABITACION SELECCIONADA---------------------------------------" + habitacionSeleccionada);
                if (habitacionSeleccionada === 0) {
                  console.log("----------------------------------------No se encontró habitación---------------------------------------");
                  return res.status(200).json({ msg: 'No se encontró habitación' })
                }
                const precioAmbulatorio = parseFloat(habitacionSeleccionada.costo_ambulatorio)
                const precioDiario = parseFloat(habitacionSeleccionada.costo_diario)
                const cuentas = await Cuenta.findAll({
                  where: { id_expediente: req.body.id, estado: 1 },
                  order: [['createdAt', 'DESC']],
                });
        
                if (cuentas.length === 0) {
                  return res.status(4002).json({ msg: 'No se encontró ninguna cuenta activa para este expediente' });
                }
                const cuentaSeleccionada = cuentas[0]
                console.log("Cuenta encontrada: ------------------------", cuentaSeleccionada);
        
                // CALCULAR EL TOTAL A PAGAR POR UTILIZAR LA HABITACIÓN
                const fechaHora1 = moment(registroMasReciente.createdAt)
                const fechaHora2 = moment()
                const diferenciaEnMilisegundos = fechaHora2.diff(fechaHora1)
                const diferenciaEnHoras = moment.duration(diferenciaEnMilisegundos).asHours()
                console.log(" ------------------------ FECHA INGRESO " + fechaHora1 + " ----------------FECHA EGRESO------------------ " +fechaHora2);
                
                console.log(" ------------------------ TOTAL HORAS " + diferenciaEnHoras.toFixed(2) + "----------------------------------");
                if (diferenciaEnHoras.toFixed(2) <= 6) {
                    console.log(" ------------------------ENTRANDO AL IF ---------------------------");
                  await DetalleCuentas.create({
                    id_cuenta: cuentaSeleccionada.id,
                    tipo: "Pago por servicio de habitación",
                    id_externo: parseInt(registroMasReciente.id_habitacionDestino),
                    subtotal: precioAmbulatorio,
                  });
                  await cuentaSeleccionada.update({ total: precioAmbulatorio});

                } else {
                    console.log(" ------------------------ENTRANDO AL ELSE ---------------------------");
                    const diasCompletos = Math.ceil(diferenciaEnHoras / 24)
                    const subtotal = precioDiario * diasCompletos
                    await DetalleCuentas.create({
                        id_cuenta: cuentaSeleccionada.id,
                        tipo: "Pago por servicio de habitación",
                        id_externo: parseInt(registroMasReciente.id_habitacionDestino),
                        subtotal: subtotal,
                    });
                    await cuentaSeleccionada.update({ total: subtotal});
                }

            } else {
              console.log('----------------------------------No se encontró un log que coincida con los datos-------------------------------------');
            }
          })
          .catch(err => {
            console.error('Error al obtener logs:', err);
            return res.status(4003).json({ msg: 'No se encontró un log que coincida con los datos' });
          });
        }
        
        Cuenta.findAll({
            where: { 
                id_expediente:req.body.id,
                estado: 1
                
        }})
            .then((cuentas)=>{
                if(cuentas.length > 0){
                    Cuenta.update(
                        {
                            pendiente_de_pago: cuentas[0].total - cuentas[0].total_pagado
                        },
                        {
                            where:{
                                id: cuentas[0].id
                            }
                        }
                    )
                }}

            ) 

        if (typeof req.body.nombre_encargado === 'undefined'){
            Expediente.update(
                { estado: req.body.estado },
                { where: { 
                    id: req.body.id 
                } }
            )
            .then(marca => res.status(200).send('El registro ha sido modificado'))
            .catch(error => {
                console.log(error)
                return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
            });
        } else {
            Expediente.update(
                { 
                    estado: req.body.estado,
                    nombre_encargado: req.body.nombre_encargado,
                    cui_encargado: req.body.cui_encargado,
                    contacto_encargado: req.body.contacto_encargado,
                    parentesco_encargado: req.body.parentesco_encargado,
                    edad_encargado: req.body.edad_encargado,
                 },
                { where: { 
                    id: req.body.id 
                } }
            )
            .then(marca => res.status(200).send('El registro ha sido modificado'))
            .catch(error => {
                console.log(error)
                return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
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
        Expediente.findAll({attributes: ['id', 'nombres']})
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

    listQuirofano (req, res) {
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

        var condition = busqueda ? { [Op.or]: [{ nombres: { [Op.like]: `%${busqueda}%` }, estado: 3 }] } : {estado: 3} ;

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

    listHospitalizacion (req, res) {
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

        var condition = busqueda ? { [Op.or]: [{ nombres: { [Op.like]: `%${busqueda}%` }, estado: 1 }] } : {estado: 1} ;

        Expediente.findAndCountAll({
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
                }
            ],
            where: condition,
            order: [[criterio || 'id', order || 'ASC']],
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

    listIntensivo (req, res) {
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

        var condition = busqueda ? { [Op.or]: [{ nombres: { [Op.like]: `%${busqueda}%` }, estado: 4 }] } : {estado: 4} ;

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

    listEmergencia (req, res) {
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

        var condition = busqueda ? { [Op.or]: [{ nombres: { [Op.like]: `%${busqueda}%` }, estado: 5 }] } : {estado: 5} ;

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
    
    listReingreso (req, res) {
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
};

