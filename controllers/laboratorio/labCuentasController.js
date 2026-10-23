'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Cuenta = db.lab_cuentas;
const Expediente = db.expedientes;
const detallePagoCuentas = db.lab_detalle_pago_cuentas;
const detalleCuentas = db.lab_detalle_cuentas;
const Seguro = db.seguros;
const PagoSeguro = db.lab_pago_seguros;
const Op = db.Sequelize.Op;
const examenes = db.examenes_realizados;

// Si el paciente ya egreso y en la caja del hospital solo faltaba el laboratorio,
// al cobrarlo aqui se cierra tambien su cuenta del hospital.
const { cerrarCuentaSiSolvente } = require('../caja/cuentasController');
async function cerrarHospitalTrasLaboratorio(idLabCuenta) {
    const lab = await Cuenta.findByPk(idLabCuenta, { attributes: ['id_expediente'] });
    if (!lab || !lab.id_expediente) return;
    const expediente = await Expediente.findByPk(lab.id_expediente, { attributes: ['estado'] });
    if (!expediente || [1, 3, 4, 5].includes(Number(expediente.estado))) return; // sigue internado
    const cuentas = await db.cuentas.findAll({
        where: { id_expediente: lab.id_expediente, estado: 1, fecha_egreso: { [Op.ne]: null } }
    });
    for (const c of cuentas) await cerrarCuentaSiSolvente(c);
}

// ─── Caja del laboratorio agrupada por paciente ─────────────────────────────
// Cada orden de laboratorio crea su propia lab_cuenta; en la caja se cobra una
// sola vez por paciente el total de todas sus cuentas abiertas.
const q2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const METODOS = ['efectivo', 'tarjeta', 'deposito', 'cheque', 'seguro', 'transferencia'];
const ESTADOS_DENTRO = [1, 3, 4, 5, 91, 93, 94, 95];
// createdAt es UTC real; fecha de Guatemala (GMT-6) en YYYY-MM-DD.
const fechaGT = (d) => new Date(new Date(d).getTime() - 6 * 3600 * 1000).toISOString().slice(0, 10);

function agruparPorPaciente(cuentas) {
    const grupos = new Map();
    for (const c of cuentas) {
        const g = grupos.get(c.id_expediente) || [];
        g.push(c);
        grupos.set(c.id_expediente, g);
    }
    return [...grupos.values()].map((g) => {
        const suma = (campo) => q2(g.reduce((a, c) => a + (parseFloat(c[campo]) || 0), 0));
        const sol = g.map((c) => Number(c.solicitud_descuento));
        return {
            id: g[0].id_expediente,
            id_expediente: g[0].id_expediente,
            expediente: g[0].expediente,
            cuentas: g.map((c) => c.id),
            numero: g.map((c) => c.numero).join(', '),
            total: suma('total'),
            total_pagado: suma('total_pagado'),
            pendiente_de_pago: suma('pendiente_de_pago'),
            descuento: suma('descuento'),
            solicitud_descuento: sol.includes(2) ? 2 : (sol.includes(1) ? 1 : (sol.includes(0) ? 0 : 3)),
            estado: 1,
            primeraOrden: g[0].createdAt,
            ultimaOrden: g[g.length - 1].createdAt,
        };
    });
}

// Desde cuando esta pendiente: la fecha de egreso de la estancia en la que se
// pidio el laboratorio; si el paciente sigue internado, null; si es paciente
// ambulatorio de laboratorio (sin estancia), hoy.
async function pendienteDesde(fila) {
    const estancia = await db.cuentas.findOne({
        where: {
            id_expediente: fila.id_expediente,
            createdAt: { [Op.lte]: fila.ultimaOrden },
            [Op.or]: [{ fecha_egreso: null }, { fecha_egreso: { [Op.gte]: fechaGT(fila.primeraOrden) } }],
        },
        order: [['createdAt', 'DESC']],
        attributes: ['fecha_egreso'],
    });
    if (estancia && estancia.fecha_egreso) return estancia.fecha_egreso;
    if (estancia && fila.expediente && ESTADOS_DENTRO.includes(Number(fila.expediente.estado))) return null;
    return fechaGT(new Date());
}

// Listado paginado de pacientes (vuetable) a partir de sus lab_cuentas abiertas.
async function listarPorPaciente(req, where, conPendienteDesde) {
    const cuentas = await Cuenta.findAll({
        where,
        include: [{ model: Expediente }],
        order: [['createdAt', 'ASC']],
    });
    const texto = (req.query.search || '').toLowerCase();
    let filas = agruparPorPaciente(cuentas)
        .filter((f) => !texto || `${f.expediente?.nombres} ${f.expediente?.apellidos} ${f.expediente?.expediente}`.toLowerCase().includes(texto));
    if (conPendienteDesde) filas = filas.filter((f) => f.pendiente_de_pago > 0); // ya pagado: no se cobra

    const campo = { 'expediente.nombres': (f) => f.expediente?.nombres || '', 'expediente.apellidos': (f) => f.expediente?.apellidos || '',
        total: (f) => f.total, pendiente_de_pago: (f) => f.pendiente_de_pago }[req.query.criterio] || ((f) => new Date(f.ultimaOrden).getTime());
    const dir = String(req.query.order).toLowerCase() === 'asc' ? 1 : -1;
    filas.sort((a, b) => (campo(a) > campo(b) ? dir : campo(a) < campo(b) ? -dir : 0));

    const limit = +req.query.limit || 10;
    const page = Math.max(0, (+req.query.page || 1) - 1);
    const data = filas.slice(page * limit, page * limit + limit);
    if (conPendienteDesde) {
        await Promise.all(data.map(async (f) => { f.pendiente_desde = await pendienteDesde(f); }));
    }
    return { total: filas.length, last_page: Math.ceil(filas.length / limit), current_page: page + 1, from: page, to: Math.ceil(filas.length / limit), data };
}

module.exports = {
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
            solicitud_descuento: 3
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

        // La tabla del corte de laboratorio filtra por el DÍA en que se pagaron los
        // exámenes (lab_cuentas.fecha_corte).
        const fechaPago = req.query.fecha_corte;
        var condition = { estado: 0 };
        if (fechaPago) condition.fecha_corte = fechaPago;
        if (busqueda) condition[Op.or] = [{ '$Expediente.nombres$': { [Op.like]: `%${busqueda}%` } }, { '$Expediente.apellidos$': { [Op.like]: `%${busqueda}%` } }];

        Cuenta.findAndCountAll({ 
            include: [
                {
                    model: Expediente,
                }
            ],
            where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {
            data.rows = data.rows.map(cuenta => {
                const cuentaJSON = cuenta.toJSON();
                const [a, m, d] = cuentaJSON.fecha_corte.split('-')
                return {
                    ...cuentaJSON,
                    fecha_corte: d + '-' + m + '-' + a
                };
            });
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

        var condition = busqueda?{ [Op.or]:[ {id: { [Op.like]: `%${busqueda}%` }}],[Op.and]:[{estado:0}] } : {estado:0}
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
    
    async listNoPayDiscountRequest(req, res) {
        try {
            res.send(await listarPorPaciente(req, { estado: 1, solicitud_descuento: 2 }, false));
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },

    // Descuento por paciente (form.id_expediente) o por una cuenta (form.id).
    // descuento es un MONTO en quetzales (asi lo pide y lo muestra la caja).
    //  2 = solicitar: el monto se reparte entre las cuentas abiertas segun su pendiente
    //  1 = aprobar: cada cuenta descuenta su parte del pendiente
    //  0 = rechazar
    async DiscountRequest (req, res) {
        const form = req.body.form;
        const t = await db.sequelize.transaction();
        try {
            const where = form.id_expediente ? { id_expediente: form.id_expediente, estado: 1 } : { id: form.id };
            const cuentas = await Cuenta.findAll({ where, order: [['id', 'ASC']], transaction: t });
            if (form.solicitud_descuento === 2) {
                const monto = q2(form.descuento);
                const total = q2(cuentas.reduce((a, c) => a + (parseFloat(c.pendiente_de_pago) || 0), 0));
                if (monto <= 0 || monto > total) {
                    await t.rollback();
                    return res.status(400).json({ msg: `El descuento debe ser mayor a 0 y menor a Q${total}` });
                }
                let repartido = 0;
                for (const [k, c] of cuentas.entries()) {
                    const parte = k === cuentas.length - 1
                        ? q2(monto - repartido)
                        : q2(monto * (parseFloat(c.pendiente_de_pago) || 0) / total);
                    repartido = q2(repartido + parte);
                    await c.update({ solicitud_descuento: 2, descuento: parte }, { transaction: t });
                }
            } else if (form.solicitud_descuento === 1) {
                for (const c of cuentas.filter((x) => Number(x.solicitud_descuento) === 2)) {
                    const parte = q2(c.descuento);
                    await c.update({
                        solicitud_descuento: 1,
                        total_pagado: q2((parseFloat(c.total_pagado) || 0) + parte),
                        pendiente_de_pago: q2(Math.max(0, (parseFloat(c.pendiente_de_pago) || 0) - parte)),
                    }, { transaction: t });
                }
            } else if (form.solicitud_descuento === 0) {
                for (const c of cuentas.filter((x) => Number(x.solicitud_descuento) === 2)) {
                    await c.update({ solicitud_descuento: 0, descuento: 0 }, { transaction: t });
                }
            }
            await t.commit();
            return res.status(200).send('El registro ha sido actualizado');
        } catch (error) {
            await t.rollback();
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },

    // Un renglon por paciente con el total de sus cuentas de laboratorio abiertas.
    async listNoPay(req, res) {
        try {
            res.send(await listarPorPaciente(req, { estado: 1 }, true));
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },

    // Cobro unico por paciente: liquida todas sus cuentas de laboratorio abiertas.
    // Los metodos de pago se reparten en orden entre las cuentas, y cada cuenta
    // lleva su propio detalle de pago (asi el corte sigue cuadrando por cuenta).
    async cobrarPaciente(req, res) {
        const b = req.body;
        const usuario = req.user?.user ?? b.user;
        const t = await db.sequelize.transaction();
        try {
            const cuentas = await Cuenta.findAll({
                where: { id_expediente: b.id_expediente, estado: 1 },
                order: [['id', 'ASC']],
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (!cuentas.length) {
                await t.rollback();
                return res.status(404).json({ msg: 'El paciente no tiene cuentas de laboratorio pendientes' });
            }
            if (cuentas.some((c) => Number(c.solicitud_descuento) === 2)) {
                await t.rollback();
                return res.status(400).json({ msg: 'El paciente tiene un descuento pendiente de aprobación' });
            }
            const pendiente = q2(cuentas.reduce((a, c) => a + (parseFloat(c.pendiente_de_pago) || 0), 0));
            const resto = {};
            for (const m of METODOS) resto[m] = q2(b[m]);
            const pago = q2(METODOS.reduce((a, m) => a + resto[m], 0));
            if (Math.abs(pago - pendiente) >= 0.01) {
                await t.rollback();
                return res.status(400).json({ msg: `El total ingresado (Q${pago}) no concuerda con el total a pagar (Q${pendiente})` });
            }

            const ahoraGT = new Date(Date.now() - 6 * 3600 * 1000);
            for (const c of cuentas) {
                let falta = q2(c.pendiente_de_pago);
                const usa = {};
                for (const m of METODOS) {
                    const v = Math.max(0, Math.min(resto[m], falta));
                    usa[m] = q2(v);
                    resto[m] = q2(resto[m] - v);
                    falta = q2(falta - v);
                }
                const monto = q2(METODOS.reduce((a, m) => a + usa[m], 0));
                await c.update({
                    estado: 0,
                    total_pagado: q2((parseFloat(c.total_pagado) || 0) + monto),
                    pendiente_de_pago: 0,
                    fecha_corte: ahoraGT,
                    updated_by: usuario,
                }, { transaction: t });
                if (monto > 0) {
                    const det = await detallePagoCuentas.create({
                        ...usa, total: monto, tipo: 'finiquito', id_lab_cuenta: c.id, created_by: usuario,
                    }, { transaction: t });
                    if (usa.seguro > 0 && b.id_seguro) {
                        await PagoSeguro.create({
                            id_lab_detalle_pago_cuenta: det.id, monto: usa.seguro, id_seguro: b.id_seguro,
                            total: usa.seguro, pagado: 0, por_pagar: usa.seguro,
                        }, { transaction: t });
                    }
                }
                await examenes.update({ estado: 2 }, { where: { id_cuenta: c.id, estado: 1 }, transaction: t });
            }
            if (q2(b.seguro) > 0 && b.id_seguro) {
                await Seguro.update({ solvente: 0 }, { where: { id: b.id_seguro }, transaction: t });
            }
            await t.commit();
            // Si ya egreso y solo faltaba el laboratorio, se cierra tambien su cuenta del hospital.
            await cerrarHospitalTrasLaboratorio(cuentas[0].id).catch((e) => console.error(e));
            return res.status(200).json({ msg: 'La cuenta de laboratorio ha sido pagada' });
        } catch (error) {
            await t.rollback();
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
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
                updated_by: req.user?.user ?? req.body.user,
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
        let nuevaFecha = new Date(); // Crear una nueva instancia de fecha
        nuevaFecha.setHours(nuevaFecha.getHours() - 6);
        if (req.body.tipo === 'finiquito'){
          console.log(req.body.id)
            console.log("HOLA")
            Cuenta.update(
                { 
                    estado: 0,
                    total_pagado: req.body.total_pagado,
                    pendiente_de_pago: req.body.pendiente_de_pago,
                    fecha_corte: nuevaFecha
                },
                // Idempotente: solo se finiquita una cuenta abierta.
                { where: {
                    id: req.body.id,
                    estado: 1
                } }
            )
            .then(([actualizadas]) =>{
                if (!actualizadas) {
                    return res.status(409).json({ msg: 'Esta cuenta ya fue pagada' });
                }
                cerrarHospitalTrasLaboratorio(req.body.id).catch((e) => console.error(e))
                Expediente.update(
                    {solvencia: 0},
                    {where: {
                        id: req.body.id_expediente
                    }}
                ).catch((error)=>{console.error(error)})
                detallePagoCuentas.create(
                    {
                        efectivo: req.body.efectivo,
                        tarjeta: req.body.tarjeta,
                        deposito: req.body.deposito,
                        cheque: req.body.cheque,
                        seguro: req.body.seguro,
                        transferencia: req.body.transferencia,
                        total: req.body.total,
                        tipo: req.body.tipo,
                        id_lab_cuenta: req.body.id,
                        created_by: req.user?.user ?? req.body.user,
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
                                id_lab_detalle_pago_cuenta: detalle_cuenta.id,
                                monto: req.body.seguro,
                                id_seguro: req.body.id_seguro,
                                total: req.body.seguro,
                                pagado: 0,
                                por_pagar: req.body.seguro,
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

                        examenes.findAll({
                            where: {
                                id_cuenta: req.body.id,
                                estado: 1
                            }
                        })
                        .then(examenes => {
                            if (examenes.length > 0) {
                                const updatePromises = examenes.map(examen => {
                                    return examen.update({ estado: 2 });
                                });
                                return Promise.all(updatePromises)
                                    .then(() => {
                                        res.status(200).send('La cuenta ha sido pagada');
                                    });
                            } else {
                                return res.status(400).json({ msg: 'No hay exámenes activos para actualizar' });
                            }
                        })
                        .catch(error => {
                            console.log(error);
                            return res.status(400).json({ msg: 'Ha ocurrido un error al consultar los exámenes' });
                        });
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
            // Idempotente: el abono solo se aplica si lo pagado sigue siendo lo que vio la pantalla.
            const pagadoAntes = parseFloat(req.body.total_pagado) - (parseFloat(req.body.total) || 0);
            const condicionPagado = Number.isFinite(pagadoAntes)
                ? (pagadoAntes < 0.005
                    ? { [Op.or]: [{ total_pagado: pagadoAntes.toFixed(2) }, { total_pagado: null }] }
                    : { total_pagado: pagadoAntes.toFixed(2) })
                : {};
            Cuenta.update(
                { 
                    total_pagado: req.body.total_pagado,
                    pendiente_de_pago: req.body.pendiente_de_pago
                },
                { where: {
                    id: req.body.id,
                    estado: 1,
                    ...condicionPagado
                } }
            )
            .then(([actualizadas]) =>{
                if (!actualizadas) {
                    return res.status(409).json({ msg: 'La cuenta cambió o este abono ya se registró. Actualice e intente de nuevo.' });
                }
                detallePagoCuentas.create(
                    {
                        efectivo: req.body.efectivo,
                        tarjeta: req.body.tarjeta,
                        deposito: req.body.deposito,
                        cheque: req.body.cheque,
                        seguro: req.body.seguro,
                        transferencia: req.body.transferencia,
                        total: req.body.total,
                        tipo: req.body.tipo,
                        id_lab_cuenta: req.body.id,
                        created_by: req.user?.user ?? req.body.user,
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
        examenes.update(
            {
                estado: 2, 
             },
            { where: { 
                id_cuenta: req.body.id 
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

    async getSearch(req, res) {
        const idExpediente = parseInt(req.query.search, 10)// Obtener el id_expediente de la consulta
        console.log("ID Expediente recibido:", idExpediente);
        try {
          // Solo se consideran lab_cuentas de la admision actual: creadas desde el
          // ultimo ingreso (expedientes.fecha_ingreso_reciente). Asi un reingreso no
          // toma la lab_cuenta de una admision anterior; si no hay examenes nuevos,
          // no devuelve ninguna en vez de tomar una vieja.
          const expediente = await Expediente.findByPk(idExpediente, { attributes: ['fecha_ingreso_reciente'] });
          const desdeIngreso = expediente ? expediente.fecha_ingreso_reciente : null;
          const whereLab = { id_expediente: idExpediente };
          if (desdeIngreso) whereLab.createdAt = { [Op.gte]: desdeIngreso };
          const cuenta = await Cuenta.findAll({
            where: whereLab,
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
      }      
};

