'use strict'
const Sequelize = require('sequelize');
const db = require("../../models");
const Cuenta = db.cuentas;
const Expediente = db.expedientes;
const detallePagoCuentas = db.detalle_pago_cuentas;
const Seguro = db.seguros;
const PagoSeguro = db.lab_pago_seguros;
const Op = db.Sequelize.Op;
const MovimientoMedicamento = db.detalle_consumo_medicamentos;
const MovimientoComun = db.detalle_consumo_comunes;
const MovimientoQuirurgico = db.detalle_consumo_quirugicos;
const Medicamento = db.medicamentos;
const DetalleHabitacion = db.detalle_habitaciones

// Calcula el desglose de una cuenta para el corte/tabla: honorarios, laboratorio cobrado
// aqui con el cobro anterior y el total de hospital = total_pagado - ambos.
// Devuelve strings con 2 decimales. Se usa en listPay y listCortesPerDate.
async function desgloseCuenta(c, plain) {
    const honorarios = await db.detalle_honorarios.sum('total', {
        where: { id_cuenta: c.id, estado: { [Op.ne]: 100 } }
    }) || 0;

    // El laboratorio se cobra en su caja (lab_cuentas); aqui solo cuenta lo que se
    // haya cobrado de laboratorio en la caja del hospital con el cobro anterior.
    const laboratorio = parseFloat(plain.pagado_laboratorio) || 0;

    const totalPagado = parseFloat(plain.total_pagado) || 0;
    return {
        total_honorarios: parseFloat(honorarios).toFixed(2),
        total_laboratorio: parseFloat(laboratorio).toFixed(2),
        total_hospital: Math.max(0, totalPagado - parseFloat(honorarios) - parseFloat(laboratorio)).toFixed(2)
    };
}

// Totales REALES por categoria de una cuenta (para el cobro separado):
//   honorarios  = suma de detalle_honorarios (excluye anulados, estado 100)
//   laboratorio = suma de examenes de la cuenta de laboratorio del ingreso
//   hospital    = resto del total de la cuenta (total - honorarios - laboratorio)
async function totalesPorCategoria(cuenta) {
    const honorarios = parseFloat(await db.detalle_honorarios.sum('total', {
        where: { id_cuenta: cuenta.id, estado: { [Op.ne]: 100 } }
    }) || 0);

    // La cuenta del hospital no incluye laboratorio (los examenes viven en lab_cuentas y
    // se cobran en su caja). Aqui solo se informa el laboratorio de la admision.
    const expediente = await db.expedientes.findByPk(cuenta.id_expediente, { attributes: ['fecha_ingreso_reciente'] });
    const desdeIngreso = expediente ? expediente.fecha_ingreso_reciente : null;
    const labs = await db.lab_cuentas.findAll({
        where: {
            id_expediente: cuenta.id_expediente,
            estado: { [Op.in]: [0, 1] },
            ...(desdeIngreso ? { createdAt: { [Op.gte]: desdeIngreso } } : {})
        }
    });
    let laboratorio = 0;
    let laboratorioAbierto = 0;
    for (const l of labs) {
        const examenes = parseFloat(await db.examenes_realizados.sum('total', { where: { id_cuenta: l.id } }) || 0);
        laboratorio += examenes;
        if (Number(l.estado) === 1) laboratorioAbierto += Math.max(0, examenes - (parseFloat(l.total_pagado) || 0));
    }
    // Abonos a laboratorio hechos antes en la caja del hospital (cobro anterior).
    const laboratorioPendiente = Math.max(0, laboratorioAbierto - (parseFloat(cuenta.pagado_laboratorio) || 0));

    const hospital = Math.max(0, (parseFloat(cuenta.total) || 0) - honorarios);
    return { hospital, honorarios, laboratorio, laboratorioPendiente };
}

// Desglose de cobro: hospital y honorarios se cobran en la caja del hospital;
// laboratorio en la caja del laboratorio (aqui solo se informa su estado).
async function desgloseDe(cuenta) {
    const tot = await totalesPorCategoria(cuenta);
    const cat = (total, pagado) => ({
        total: +(Number(total) || 0).toFixed(2),
        pagado: +(Number(pagado) || 0).toFixed(2),
        pendiente: +Math.max(0, (Number(total) || 0) - (Number(pagado) || 0)).toFixed(2)
    });
    const hospital = cat(tot.hospital, cuenta.pagado_hospital);
    const honorarios = cat(tot.honorarios, cuenta.pagado_honorarios);
    const laboratorio = {
        total: +tot.laboratorio.toFixed(2),
        pendiente: +tot.laboratorioPendiente.toFixed(2),
        pagado: +Math.max(0, tot.laboratorio - tot.laboratorioPendiente).toFixed(2)
    };
    const pendientes = [
        ...(hospital.pendiente > 0 ? ['hospital'] : []),
        ...(honorarios.pendiente > 0 ? ['honorarios'] : []),
        ...(laboratorio.pendiente > 0 ? ['laboratorio'] : [])
    ];
    return { id_cuenta: cuenta.id, hospital, honorarios, laboratorio, pendientes, solvente: pendientes.length === 0 };
}

// Cierra la cuenta (estado 0, expediente solvente) solo si hospital, honorarios y
// laboratorio estan pagados. Lo llama tambien la caja del laboratorio al cobrar.
async function cerrarCuentaSiSolvente(cuenta, transaction) {
    const d = await desgloseDe(cuenta);
    if (d.solvente && Number(cuenta.estado) !== 0) {
        await cuenta.update({ estado: 0 }, { transaction });
        await Expediente.update({ solvencia: 1 }, { where: { id: cuenta.id_expediente }, transaction });
    }
    return d;
}

module.exports = {
    desgloseDe,
    cerrarCuentaSiSolvente,
    create(req, res) {
        let form = req.body
        const datos = {
            numero: form.numero,
            fecha_ingreso: form.fecha_ingreso,
            motivo: form.motivo,
            descripcion: form.descripcion,
            otros: form.otros,
            total: form.total,
            estado: 1,
            id_expediente: form.id_expediente,
            created_by: req.user?.user ?? req.body.user,
            descuento: 0.0,
            solicitud_descuento: 3,
            tipo: form.tipo_cuenta
         };

        Cuenta.create(datos)
        .then(tipo => {
            return tipo.update({ numero: tipo.id });
        })
        .then(updatedTipo => {
            console.log(updatedTipo);
            res.send(updatedTipo);
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

        //var condition = busqueda ? { [Op.or]:[{ '$Expediente.expediente$': { [Op.like]: `%${busqueda}%` } }, { '$Expediente.nombres$': { [Op.like]: `%${busqueda}%` } }, { '$Expediente.apellidos$': { [Op.like]: `%${busqueda}%` } }] } : null ;
        var condition = {estado: 1}
        console.log(busqueda)
        Cuenta.findAndCountAll({ 
            include: [
                {
                    model: Expediente,
                }
            ],
            where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
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

    listNoPay(req, res) {
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
        var condition = { estado:1}

        const estadosExcluidos = [1, 3, 4, 5];

        Cuenta.findAndCountAll({
            include: [
                {
                    model: Expediente,
                    where: {
                       estado: {
                         [Op.notIn]: estadosExcluidos
                       },
                       // Los pacientes de seguro van a "Seguros por cobrar", no aquí.
                       es_seguro: 0
                    },
                    required: true
                }
            ],
            where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(async data => {
        // Estado de pago por fila: que falta pagar (hospital, honorarios, laboratorio).
        // Una cuenta egresada que ya esta pagada completa (hospital, honorarios y
        // laboratorio) se cierra aqui y deja de listarse: cubre los cobros hechos
        // por flujos que no la cerraban y las cuentas corregidas a mano.
        // ponytail: efecto en un GET; si se unifica el cierre en todos los cobros, quitar.
        const filas = [];
        for (const c of data.rows) {
            const d = await desgloseDe(c);
            if (d.solvente && c.fecha_egreso) {
                await cerrarCuentaSiSolvente(c);
                continue;
            }
            filas.push({ ...c.toJSON(), pendientes_pago: d.pendientes });
        }
        data = { count: data.count - (data.rows.length - filas.length), rows: filas };
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems,last_page:response.totalPages, current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    listNoPayParcial(req, res) {
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
        var condition = { estado:10}

        const estadosIncluidos = [91, 93, 94, 95];

        Cuenta.findAndCountAll({ 
            include: [
                {
                    model: Expediente,
                    where: {
                       estado: {
                         [Op.in]: estadosIncluidos
                       }
                    },
                    required: true
                }
            ],
            where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        console.log('data: '+JSON.stringify(data.rows))
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems,last_page:response.totalPages, current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    listCortesPerDate(req, res) {
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

        const fecha = req.query.fecha_corte.split(' ')[0];
        const condition = {
            [Op.and]: [
                { estado: 0 },
                Sequelize.where(Sequelize.fn('DATE', Sequelize.col('cuentas.updatedAt')), fecha)
            ]
        };

        Cuenta.findAll({
            include: [
                { model: Expediente, include: [{ model: db.medicos, as: 'medico' }] },
                { model: db.detalle_pago_cuentas }
            ],
            where: condition
        })
        .then(async (cuentas) => {
            // El corte de hospital debe reflejar SOLO los consumos de hospital. El total
            // de la cuenta incluye, además, honorarios médicos y exámenes de laboratorio
            // (se suman al egresar). Aquí los restamos para dejar solo lo de hospital:
            //   total_hospital = total_pagado - honorarios - laboratorio
            // Honorarios: ligados directo a la cuenta. Laboratorio: en la lab_cuenta de la
            // admisión (misma que cobró el egreso). Honorarios y lab van en sus propios cortes.
            const rows = await Promise.all(cuentas.map(async (c) => {
                const plain = c.get({ plain: true });

                const honorarios = await db.detalle_honorarios.sum('total', {
                    where: { id_cuenta: c.id, estado: { [Op.ne]: 100 } }
                }) || 0;

                // Laboratorio: se cobra en su caja (lab_cuentas), no en esta cuenta. Solo se
                // descuenta lo cobrado de laboratorio aqui con el cobro anterior.
                const laboratorio = parseFloat(plain.pagado_laboratorio) || 0;

                const totalPagado = parseFloat(plain.total_pagado) || 0;
                const totalHospital = Math.max(0, totalPagado - parseFloat(honorarios) - parseFloat(laboratorio));

                plain.total_honorarios = parseFloat(honorarios).toFixed(2);
                plain.total_laboratorio = parseFloat(laboratorio).toFixed(2);
                plain.total_hospital = totalHospital.toFixed(2);

                // Categoría del paciente para el corte. Se usa el campo cuentas.tipo_paciente
                // (guardado al asignar habitación / reingreso / emergencia). Para cuentas
                // viejas sin ese campo, se cae a la deducción por costo (Emergencia por tipo
                // de habitación; el resto comparando costo_base con las columnas de costo).
                let categoria = plain.tipo_paciente || null;
                if (!categoria) {
                    categoria = 'Hospitalización';
                    const detalleHab = await db.detalle_habitaciones.findOne({
                        where: { id_cuenta: c.id },
                        order: [['id', 'ASC']]
                    });
                    if (detalleHab) {
                        if (detalleHab.tipo_habitacion === 'Emergencia') {
                            categoria = 'Emergencia';
                        } else if (detalleHab.id_habitacion) {
                            const hab = await db.habitaciones.findByPk(detalleHab.id_habitacion);
                            if (hab) {
                                const base = parseFloat(detalleHab.costo_base);
                                if (parseFloat(hab.costo_ambulatorio) === base) categoria = 'Ambulatorio';
                                else if (parseFloat(hab.costo_estudio_de_sueno) === base) categoria = 'Estudio de sueño';
                                else if (parseFloat(hab.costo_quimioterapia) === base) categoria = 'Quimioterapia';
                                else categoria = 'Hospitalización';
                            }
                        }
                    }
                }
                plain.categoria = categoria;

                // Número de factura de la cuenta (si existe).
                const factura = await db.facturas.findOne({
                    where: { id_cuenta_hospital: c.id },
                    attributes: ['numero'],
                    order: [['id', 'DESC']]
                });
                plain.numero_factura = (factura && factura.numero) ? factura.numero : null;
                return plain;
            }));

            res.send(rows);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    listNoPayDiscountRequest(req, res) {
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

        const busqueda = req.query.search || "";
        const page = req.query.page - 1;
        const size = req.query.limit;
        const criterio = req.query.criterio;
        const order = req.query.order;
        const { limit, offset } = getPagination(page, size);

        let condition = {
            estado: 1,
            "$Expediente.solvencia$": 0,
            [Op.or]: [
                { solicitud_descuento: 2 },
                { solicitud_descuento: 3 },
                { solicitud_descuento: 4 }
            ],
            [Op.and]: [
                {
                [Op.or]: [
                    { "$Expediente.estado$": 0 },
                    { "$Expediente.estado$": 6 },
                    { "$Expediente.estado$": 7 },
                    { "$Expediente.estado$": 8 },
                    { "$Expediente.estado$": 9 }
                ]
                }
            ]
        };

        // si viene algo en búsqueda, lo agrego al Op.and
        if (busqueda) {
            condition[Op.and].push({
                [Op.or]: [
                { numero: { [Op.like]: `%${busqueda}%` } }, // está en Cuenta
                { "$Expediente.nombres$": { [Op.like]: `%${busqueda}%` } }, // viene de Expediente
                { "$Expediente.apellidos$": { [Op.like]: `%${busqueda}%` } } // viene de Expediente
                ]
            });
        }

        Cuenta.findAndCountAll({
            include: [
                {
                    model: Expediente,
                }
            ],
            where: condition,
            order: [[`${criterio}`, `${order}`]],
            limit,
            offset
        })
            .then(data => {
                const response = getPagingData(data, page, limit);
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
                console.log(error);
                return res
                    .status(400)
                    .json({ msg: "Ha ocurrido un error, por favor intente más tarde" });
            });
    },

    listPay(req, res) {
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

        // La tabla del corte de hospital filtra por FECHA DE EGRESO del paciente.
        const fechaEgreso = req.query.fecha_egreso;
        var condition = { estado: 0 };
        if (fechaEgreso) condition.fecha_egreso = fechaEgreso;
        if (busqueda) condition[Op.or] = [{ id: { [Op.like]: `%${busqueda}%` } }];
        console.log(busqueda)
        Cuenta.findAndCountAll({
            include: [
                {
                    model: Expediente,
                }
            ],
            where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(async data => {
            const response = getPagingData(data, page, limit);
            // Agregar el desglose (hospital / honorarios / laboratorio) a cada fila.
            const filas = await Promise.all(response.referido.map(async (c) => {
                const plain = c.get({ plain: true });
                const d = await desgloseCuenta(c, plain);
                plain.total_hospital = d.total_hospital;
                plain.total_honorarios = d.total_honorarios;
                plain.total_laboratorio = d.total_laboratorio;
                return plain;
            }));
            res.send({total:response.totalItems,last_page:response.totalPages, current_page: page+1, from:response.currentPage,to:response.totalPages,data:filas});
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    find (req, res) {
        const id = req.params.id;

        return Cuenta.findByPk(id)
        .then(cuenta => res.status(200).send(cuenta))
        .catch(error => res.status(400).send(error))
    },

    findByExp (req, res) {
        const id = req.params.id

        return Cuenta.find(id_expediente => id_expediente === id)
        .then(cuenta => res.status(200).send(cuenta))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Cuenta.update(
            { 
                numero: form.numero,
                fecha_ingreso: form.fecha_ingreso,
                motivo: form.motivo,
                descripcion: form.descripcion,
                otros: form.otros,
                total: form.total,
                estado: form.estado,
                updated_by: req.user?.user ?? req.body.user
            },
            { where: { 
                id: form.id 
            } }
        )
        .then(cuenta => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    updateMotivoIngreso(req, res) {
        console.log(req.body)
        Cuenta.update(
            { motivo: req.body.motivo },
            { where: { 
                id_expediente: req.body.id,
                estado: 1 
            } }
        )
        .then(cuenta => res.status(200).send('La nota de ingreso ha sido actualizada'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    updateMotivoEgreso(req, res) {
        Cuenta.update(
            { motivo_egreso: req.body.motivo_egreso },
            { where: { 
                id_expediente: req.body.id,
                estado: 1
            } }
        )
        .then(cuenta => res.status(200).send('El motivo de egreso ha sido actualizado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    activate (req, res) {
        Cuenta.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(cuenta => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    deactivate (req, res) {
        if (req.body.tipo === 'finiquito'){
            Cuenta.update(
                { 
                    estado: 0,
                    total_pagado: req.body.total_pagado,
                    pendiente_de_pago: req.body.pendiente_de_pago
                },
                { where: { 
                    id: req.body.id
                } }
            )
            .then((cuenta) =>{
                console.log(cuenta)
                Expediente.update(
                    {solvencia: 1},
                    {where: {
                        id: req.body.id_expediente
                    }}
                ).catch((error)=>{console.error(error)})
                detallePagoCuentas.create(
                    {
                        efectivo: req.body.efectivo,
                        tarjeta: req.body.tarjeta,
                        recargoTarjeta: req.body.recargoTarjeta,
                        deposito: req.body.deposito,
                        cheque: req.body.cheque,
                        seguro: req.body.seguro,
                        transferencia: req.body.transferencia,
                        total: req.body.total,
                        tipo: req.body.tipo,
                        id_cuenta: req.body.id
                    })
                .then(detalle_cuenta =>{
                    console.log(detalle_cuenta)
                    console.log(req.body.seguro)
                    console.log(req.body.id_seguro)
                    if ( parseInt(req.body.seguro)>0){
                    
                        Seguro.update(
                            { 
                                solvente: 0
                            },
                            { where: { 
                                id: req.body.id_seguro
                            } }
                        )
                        .then((seg)=>{
                            console.log(seg)
                        })
                        .catch((errSeg)=>{
                            console.log("---------------pagoSeguros")
                            console.error(errSeg)
                        })
    
                        PagoSeguro.create(
                            {
                                id_detalle_pago_cuenta: detalle_cuenta.id,
                                monto: req.body.seguro,
                                id_seguro: req.body.id_seguro,
                                total: req.body.seguro,
                                pagado: 0,
                                por_pagar: req.body.seguro
                            })
                            .then((pagoseg)=>{
                                res.status(200).send('El registro ha sido desactivado')
                            }

                            )
                            .catch((errSeg)=>{
                                console.error(errSeg)
                            })
                        
                    }else{
                        res.status(200).send('El registro ha sido desactivado')
                    }

                })
                .catch(error=>{
                    console.log(error)
                    return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
                })
                
            })
            .catch(error => {
                console.log(error)
                return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
            });
        } else {
            Cuenta.update(
                { 
                    total_pagado: req.body.total_pagado,
                    pendiente_de_pago: req.body.pendiente_de_pago
                },
                { where: { 
                    id: req.body.id
                } }
            )
            .then(cuenta =>{
                detallePagoCuentas.create(
                    {
                        efectivo: req.body.efectivo,
                        tarjeta: req.body.tarjeta,
                        recargoTarjeta: req.body.recargoTarjeta,
                        deposito: req.body.deposito,
                        cheque: req.body.cheque,
                        seguro: req.body.seguro,
                        transferencia: req.body.transferencia,
                        total: req.body.total,
                        tipo: req.body.tipo,
                        id_cuenta: req.body.id
                    })
                .then(detalle_cuenta =>res.status(200).send('El registro ha sido desactivado'))
                .catch(error=>{
                    console.log(error)
                    return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
                })
            })
            .catch(error => {
                console.log(error)
                return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
            });
        }
    },

    onPay (req, res) {
        Cuenta.update(
            { 
                estado: 0,
                tipo_de_pago: req.body.tipo
             },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(cuenta =>res.status(200).send('La cuenta ha sido pagada'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    get (req, res) {
        return Cuenta.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    getByAccount (req, res) {
        Cuenta.findAll({
            where:{
                id: req.query.id,
                estado: 0,
                pendiente_de_pago: 0
            },
            include: [{ model: db.detalle_pago_cuentas, as: 'detalle_pago_cuentas' }] 
        })
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    
    getByExp (req, res) {
        console.log(req.query)
        console.log("HOLA")
        return Cuenta.findAll({
            where: {
                id_expediente: req.query.id,
                estado: 1
            }
        })
            .then(tipo => res.status(200).send(tipo))
            .catch(error => {
                console.log(error)
                res.status(400).send(error)
            })
    },

    DiscountRequest (req,res) {
        console.log(req.body.form)
        let form = req.body.form
        if (form.solicitud_descuento === 0){
            Cuenta.update(
                {
                    solicitud_descuento: 0,
                    descuento: 0,
                },
                { where: { 
                    id: form.id 
                } }
            )
            .then(cuenta => res.status(200).send('El registro ha sido actualizado'))
            .catch(error => {
                console.log(error)
                return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
            });
        }
        else if (form.solicitud_descuento === 2){
            Cuenta.update(
                {
                    solicitud_descuento: 2,
                    descuento: form.descuento,
                },
                { where: { 
                    id: form.id 
                } }
            )
            .then(cuenta => res.status(200).send('El registro ha sido actualizado'))
            .catch(error => {
                console.log(error)
                return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
            });
        }
        else if (form.solicitud_descuento === 1) {
            Cuenta.findByPk(form.id)
                .then(cuenta => {
                    const descuentoAplicado = (parseFloat(cuenta.total) * parseFloat(cuenta.descuento)) / 100;
                    const nuevoTotalPagado = parseFloat(cuenta.total_pagado) + descuentoAplicado;
                    const nuevoPendienteDePago = parseFloat(cuenta.pendiente_de_pago) - descuentoAplicado;                    
        
                    return Cuenta.update({
                        solicitud_descuento: 1,
                        descuento: form.descuento,
                        total_pagado: parseFloat(nuevoTotalPagado),
                        pendiente_de_pago: parseFloat(nuevoPendienteDePago)
                    }, {
                        where: { id: form.id }
                    });
                })
                .then(cuenta => res.status(200).send('El registro ha sido actualizado'))
                .catch(error => {
                    console.log(error);
                    return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde'   
                    });
                });
        }
    },

    async getSearch(req, res) {
        const idExpediente = parseInt(req.query.search, 10)// Obtener el id_expediente de la consulta
        console.log("ID Expediente recibido:", idExpediente); 
        try {
          const cuenta = await Cuenta.findAll({
            where: { id_expediente: idExpediente },
            order: [['createdAt', 'DESC']], // Buscar por id_expediente
            include: [{ model: db.expedientes, as: 'expediente' }] 
          });

          let cuentaSeleccionada = null;
          for (const cuentas of cuenta) {
            if (cuentas.dataValues.estado == 1) {
              cuentaSeleccionada = cuentas;
              break;
            }
          }
          if (!cuentaSeleccionada) {
            return res.status(400).json({ msg: 'No se encontró ninguna cuenta activa para este expediente' });
          }
            console.log("Cuenta encontrada:", cuentaSeleccionada);
          if (cuentaSeleccionada) {
            res.send(cuentaSeleccionada); // Enviar la cuenta encontrada
          } else {
            res.status(400).json({ msg: 'No se encontró ninguna cuenta para este expediente' });
          }
        } catch (error) {
            console.error("Error en getSearch:", error);
          return res.status(500).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
      },

    async getTotales(req, res) {
        const idCuenta = req.query.id
        const area = req.params.area;
        if (idCuenta) {

            const condition = {
                [Op.and]: [
                  { id_cuenta: idCuenta },
                  { descripcion: { [Op.like]: `%${area}%` } },
                  { estado: { [Op.eq]: 1 } }
                ]
            };

            const dataMedicamento = await MovimientoMedicamento.findAll({
                include: {
                  model: Medicamento,
                  required: true,
                  where: { anestesico: { [Op.eq]: 1 } } //Para el futuro, por una extraña razón las condiciones están al revés
                },
                where: condition,
                attributes: ['total']
            });

            const dataAnestesico = await MovimientoMedicamento.findAll({
                include: {
                  model: Medicamento,
                  required: true,
                  where: { anestesico: { [Op.eq]: 0 } } //Para el futuro, por una extraña razón las condiciones están al revés
                },
                where: condition,
                attributes: ['total']
            });

            let totalMedicamentos = 0.0
            let totalAnestesicos = 0.0

            dataMedicamento.forEach(element => {
                totalMedicamentos += parseFloat(element.total)
            });

            dataAnestesico.forEach(element => {
                totalAnestesicos += parseFloat(element.total)
            });

            
            const totalComun = (await MovimientoComun.sum('total', {
                where: { 
                    id_cuenta: idCuenta,
                    estado: 1,
                    descripcion: { [Op.like]: `%${area}%` }
                }
            })) || 0;
            
            const totalQuirurgico = (await MovimientoQuirurgico.sum('total', {
                where: { 
                    id_cuenta: idCuenta,
                    estado: 1,
                    descripcion: { [Op.like]: `%${area}%` }
                }
            }) || 0);
    
            const totales = {
                totalMedicamentos: totalMedicamentos,
                totalComun: totalComun,
                totalQuirurgico: totalQuirurgico,
                totalAnestesicos: totalAnestesicos
            }
            
            return res.status(200).json(totales);
        }
        res.status(400).json({ msg: 'No se encontró ninguna cuenta para este expediente' });
        
    },

    async ingresoParcialPago(req, res) {
        const { id } = req.params;

        try {
            const expediente = await Expediente.findByPk(id);

            if (!expediente) {
                return res.status(404).json({ msg: 'Expediente no encontrado' });
            }

            // Buscar la última cuenta del expediente
            const ultimaCuenta = await Cuenta.findOne({
                where: { id_expediente: id },
                order: [['createdAt', 'DESC']],
            });
            // Idempotente y atomico: el +90 solo se aplica si el expediente aun no esta en
            // cuenta parcial (estado < 90), en el mismo UPDATE. Un segundo clic, aunque llegue
            // al mismo tiempo, ya no suma (antes dejaba al paciente en 181 y desaparecia).
            await Promise.all([
                Expediente.update(
                    { estado: db.sequelize.literal('estado + 90'), updated_by: req.user?.user ?? expediente.updated_by },
                    { where: { id, estado: { [Op.lt]: 90 } } }
                ),
                ultimaCuenta?.update({
                    estado: 10,
                    updated_by: req.user?.user ?? ultimaCuenta.updated_by,
                    pendiente_de_pago: req.body.TotalApagar,
                    total: req.body.TotalApagar,
                }),
            ]);

            return res.status(200).json({ msg: 'Expediente actualizado', data: expediente });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },

    async pagarCuentaParcial(req, res) {
        const { id } = req.params;

        try {
            const cuentaOriginal = await Cuenta.findOne({
                where: { id },
                include: [
                    {
                        model: Expediente,
                        required: true,
                    },
                    {
                        model: DetalleHabitacion,
                        required: false,
                        order: [['createdAt', 'DESC']],
                        limit: 1,
                    }
                ]
            });

            if (!cuentaOriginal) {
                return res.status(404).json({ msg: 'Cuenta no encontrada' });
            }
            // Idempotente y atomico: solo se paga una cuenta que sigue en parcial (estado 10).
            // Si otro clic ya la pago, no se crea una segunda cuenta ni se resta otra vez 90.
            const [pagadas] = await Cuenta.update(
                {
                    estado: 0,
                    total_pagado: req.body.total_pagado,
                    pendiente_de_pago: req.body.pendiente_de_pago
                },
                { where: { id, estado: 10 } }
            );
            if (pagadas === 0) {
                return res.status(409).json({ msg: 'Esta cuenta parcial ya fue pagada' });
            }

            const hoy = new Date();
            const fechaHoy = hoy.toISOString().split('T')[0];

            const nuevaCuenta = await Cuenta.create({
                numero:              cuentaOriginal.numero,
                fecha_ingreso:       fechaHoy,
                hora_ingreso:        '12:00:00',
                fecha_egreso:        cuentaOriginal.fecha_egreso        ?? null,
                hora_egreso:         cuentaOriginal.hora_egreso         ?? null,
                motivo:              cuentaOriginal.motivo              ?? null,
                motivo_egreso:       cuentaOriginal.motivo_egreso       ?? null,
                descripcion:         cuentaOriginal.descripcion         ?? null,
                otros:               cuentaOriginal.otros               ?? null,
                total:               cuentaOriginal.total,
                estado:              1,
                total_pagado:        cuentaOriginal.total_pagado        ?? 0,
                pendiente_de_pago:   cuentaOriginal.pendiente_de_pago   ?? 0,
                descuento:           cuentaOriginal.descuento           ?? null,
                solicitud_descuento: cuentaOriginal.solicitud_descuento ?? null,
                subtotal:            cuentaOriginal.subtotal            ?? 0,
                tipo:                cuentaOriginal.tipo,
                id_expediente:       cuentaOriginal.id_expediente,
                created_by:          req.user?.user ?? null,
                updated_by:          req.user?.user ?? null,
            });

            const detalleOriginal = cuentaOriginal.detalle_habitaciones?.[0];

            // Crear detalle y actualizar expediente en paralelo
            await Promise.all([
                DetalleHabitacion.create({
                    id_cuenta:       nuevaCuenta.id,
                    tipo_habitacion: detalleOriginal?.tipo_habitacion ?? null,
                    estado:          detalleOriginal?.estado          ?? 1,
                    costo_base:      detalleOriginal?.costo_base      ?? 0,
                    ingreso:         hoy,
                    salida:          null,
                    created_by:      req.user?.user ?? null,
                    updated_by:      req.user?.user ?? null,
                }),
                // Solo regresa si esta en cuenta parcial (9x), en el mismo UPDATE.
                Expediente.update(
                    { estado: db.sequelize.literal('estado - 90'), updated_by: req.user?.user ?? cuentaOriginal.expediente.updated_by },
                    { where: { id: cuentaOriginal.id_expediente, estado: { [Op.gte]: 90 } } }
                ),
            ]);

            return res.status(201).json({ msg: 'Pago procesado y nueva cuenta creada', data: nuevaCuenta });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },

    // Cobro separado: hospital y honorarios (caja del hospital) y el estado del
    // laboratorio (se cobra en su caja). Solvente cuando las tres estan pagadas.
    async desgloseCobro(req, res) {
        try {
            const cuenta = await Cuenta.findByPk(req.params.id);
            if (!cuenta) return res.status(404).json({ msg: 'Cuenta no encontrada' });
            return res.json(await desgloseDe(cuenta));
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Error al obtener el desglose de cobro' });
        }
    },

    // Abona a hospital y/o honorarios en un solo pago. El monto se aplica primero a
    // hospital y el resto a honorarios (en el orden elegido); se registra un pago
    // por categoria con sus metodos. La cuenta se cierra solo si hospital,
    // honorarios y laboratorio quedan pagados.
    async cobrarCategoria(req, res) {
        const validas = ['hospital', 'honorarios'];
        const pedidas = Array.isArray(req.body.categorias) ? req.body.categorias : [req.body.categoria];
        const categorias = validas.filter(c => pedidas.includes(c));
        const { id, id_seguro } = req.body;
        const monto = parseFloat(req.body.monto) || 0;
        if (!id || !categorias.length) {
            return res.status(400).json({ msg: 'Seleccione hospital y/o honorarios para abonar' });
        }
        if (monto <= 0) {
            return res.status(400).json({ msg: 'El monto a abonar debe ser mayor a cero' });
        }
        const t = await db.sequelize.transaction();
        try {
            const cuenta = await Cuenta.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
            if (!cuenta) { await t.rollback(); return res.status(404).json({ msg: 'Cuenta no encontrada' }); }

            const antes = await desgloseDe(cuenta);
            const pendienteElegido = categorias.reduce((a, c) => a + antes[c].pendiente, 0);
            if (monto > pendienteElegido + 0.001) {
                await t.rollback();
                return res.status(400).json({ msg: `El abono (Q${monto.toFixed(2)}) excede lo pendiente (Q${pendienteElegido.toFixed(2)})` });
            }

            // Reparto del monto por categoria y de los metodos de pago en el mismo orden.
            const metodos = ['efectivo', 'tarjeta', 'deposito', 'cheque', 'seguro', 'transferencia'];
            const disponible = Object.fromEntries(metodos.map(m => [m, parseFloat(req.body[m]) || 0]));
            let resto = monto;
            const reparto = [];
            for (const c of categorias) {
                const aplica = Math.min(resto, antes[c].pendiente);
                resto -= aplica;
                if (aplica <= 0) continue;
                let falta = aplica;
                const usa = {};
                for (const m of metodos) {
                    const v = Math.min(falta, disponible[m]);
                    usa[m] = +v.toFixed(2);
                    disponible[m] -= v;
                    falta -= v;
                }
                reparto.push({ categoria: c, monto: aplica, usa });
            }

            const cambios = {};
            for (const r of reparto) {
                cambios['pagado_' + r.categoria] = (parseFloat(cuenta['pagado_' + r.categoria]) || 0) + r.monto;
            }
            const pagH = cambios.pagado_hospital ?? (parseFloat(cuenta.pagado_hospital) || 0);
            const pagO = cambios.pagado_honorarios ?? (parseFloat(cuenta.pagado_honorarios) || 0);
            const pendienteCaja = Math.max(0, antes.hospital.total + antes.honorarios.total - pagH - pagO);
            await cuenta.update({
                ...cambios,
                total_pagado: (pagH + pagO + (parseFloat(cuenta.pagado_laboratorio) || 0)).toFixed(2),
                pendiente_de_pago: pendienteCaja.toFixed(2)
            }, { transaction: t });

            const despues = await cerrarCuentaSiSolvente(cuenta, t);

            let recargo = parseFloat(req.body.recargoTarjeta) || 0;
            for (const r of reparto) {
                const detalle = await detallePagoCuentas.create({
                    ...r.usa,
                    recargoTarjeta: recargo,
                    total: r.monto,
                    tipo: despues.solvente ? 'finiquito' : 'abono',
                    categoria: r.categoria,
                    id_cuenta: id
                }, { transaction: t });
                recargo = 0; // el recargo de tarjeta se registra una sola vez
                // Registro de seguro (igual que en el finiquito clasico).
                if (r.usa.seguro > 0 && id_seguro) {
                    await Seguro.update({ solvente: 0 }, { where: { id: id_seguro }, transaction: t });
                    await PagoSeguro.create({
                        id_detalle_pago_cuenta: detalle.id,
                        monto: r.usa.seguro,
                        id_seguro: id_seguro,
                        total: r.usa.seguro,
                        pagado: 0,
                        por_pagar: r.usa.seguro
                    }, { transaction: t });
                }
            }

            await t.commit();
            return res.json({ ok: true, solvente: despues.solvente, categorias, desglose: despues });
        } catch (error) {
            await t.rollback();
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error al procesar el abono' });
        }
    },
};

