'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const moment = require('moment');
const Paquete = db.paquetes;
const DetallePaquete = db.detalle_paquetes;
const Usuarios = db.usuarios;
const Cuenta = db.cuentas;
const MovimientoMedicamentos = db.detalle_consumo_medicamentos;
const MovimientoComun = db.detalle_consumo_comunes;
const MovimientoQuirurgico = db.detalle_consumo_quirugicos;
const Medicamento = db.medicamentos;
const Comun = db.comunes;
const Quirurgico = db.quirurgicos;
const Op = db.Sequelize.Op;
const { crearPedido } = require('../enfermeria/pedidosController');

// Guarda las fechas de consumo con el mismo criterio que los consumos (GT-6).
const restarHoras = (fecha, horas) => {
    const nueva = new Date(fecha);
    nueva.setHours(nueva.getHours() - horas);
    return nueva;
};

// Codigo del pedido automatico de reposicion (paquetes solo existen en quirofano).
const codigoQuirofano = () => {
    const ahora = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guatemala' }));
    const d = (n) => String(n).padStart(2, '0');
    return 'QUIROFANO-' + d(ahora.getDate()) + '-' + d(ahora.getMonth() + 1) + '-' +
        ahora.getFullYear() + '-' + d(ahora.getHours()) + '-' + d(ahora.getMinutes()) + '-' +
        d(ahora.getSeconds());
};

// Resuelve, a partir de una linea de detalle_paquetes, el modelo de consumo y de
// producto correctos, la columna de id y una bandera de tipo.
const resolverTipo = (det) => {
    if (det.id_medicamento != null) {
        return { Mov: MovimientoMedicamentos, Prod: Medicamento, idCol: 'id_medicamento', idProd: det.id_medicamento, flag: 'medicine' };
    }
    if (det.id_comun != null) {
        return { Mov: MovimientoComun, Prod: Comun, idCol: 'id_comun', idProd: det.id_comun, flag: 'comun' };
    }
    if (det.id_quirurgico != null) {
        return { Mov: MovimientoQuirurgico, Prod: Quirurgico, idCol: 'id_quirurgico', idProd: det.id_quirurgico, flag: 'quirurgico' };
    }
    return null;
};

// Cantidad realmente consumida que manda el front para una linea del paquete.
// Si no viene, se asume la cantidad del paquete (caso normal).
const cantidadRealDe = (det, consumos) => {
    let idProd, tipos;
    if (det.id_medicamento != null) { idProd = det.id_medicamento; tipos = ['0', '3']; }
    else if (det.id_comun != null) { idProd = det.id_comun; tipos = ['2']; }
    else if (det.id_quirurgico != null) { idProd = det.id_quirurgico; tipos = ['1']; }
    const c = (consumos || []).find(x => parseInt(x.id) === parseInt(idProd) && tipos.includes(String(x.tipo)));
    return c ? parseInt(c.cantidad) : parseInt(det.cantidad);
};

module.exports = {
    // Devuelve existencia_actual e inventariado de varios insumos de una sola vez
    // (por lotes de ids por tipo), para cargar un paquete sin hacer N llamadas.
    async getExistenciasInsumos(req, res) {
        try {
            const { comun = [], quirurgico = [], medicamento = [] } = req.body;
            const [comunes, quirurgicos, medicamentos] = await Promise.all([
                comun.length ? Comun.findAll({ where: { id: comun }, attributes: ['id', 'existencia_actual', 'inventariado'] }) : [],
                quirurgico.length ? Quirurgico.findAll({ where: { id: quirurgico }, attributes: ['id', 'existencia_actual', 'inventariado'] }) : [],
                medicamento.length ? Medicamento.findAll({ where: { id: medicamento }, attributes: ['id', 'existencia_actual'] }) : [],
            ]);
            const mapear = (arr, conInventariado) => arr.reduce((acc, x) => {
                acc[x.id] = {
                    existencia_actual: x.existencia_actual,
                    inventariado: conInventariado ? x.inventariado : null,
                };
                return acc;
            }, {});
            return res.json({
                comun: mapear(comunes, true),
                quirurgico: mapear(quirurgicos, true),
                medicamento: mapear(medicamentos, false),
            });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error al obtener las existencias' });
        }
    },

    create(req, res) {
        let form = req.body
        const datos = {
            nombre: form.nombre,
            id_usuario: form.id_usuario,
            total: form.total,
            estado: 1
        };

        Paquete.create(datos)
        .then(paquete => {
            const paquete_id = paquete.id
            let total = 0;
            let detalles = form.detalle
            let cantidad = form.detalle.length
            for (let i = 0; i < cantidad; i++){
                if (detalles[i].is_medicine === true){
                    let id_medicine = detalles[i].id_medicine
                    let datos_detalles = {
                        cantidad: detalles[i].cantidad,
                        descripcion: detalles[i].descripcion,
                        subtotal: detalles[i].total,
                        estado: 1,
                        id_paquete: paquete_id,
                        id_medicamento: id_medicine
                    }
                    total = total + parseFloat(detalles[i].total)
                    DetallePaquete.create(datos_detalles)
                }
                else if (detalles[i].is_quirurgico === true){
                    let id_medicine = detalles[i].id_medicine
                    let datos_detalles = {
                        cantidad: detalles[i].cantidad,
                        descripcion: detalles[i].descripcion,
                        subtotal: detalles[i].total,
                        estado: 1,
                        id_paquete: paquete_id,
                        id_quirurgico: id_medicine
                    }
                    total = total + parseFloat(detalles[i].total)
                    DetallePaquete.create(datos_detalles)
                }
                else if (detalles[i].is_comun === true){
                    let id_medicine = detalles[i].id_medicine
                    let datos_detalles = {
                        cantidad: detalles[i].cantidad,
                        descripcion: detalles[i].descripcion,
                        subtotal: detalles[i].total,
                        estado: 1,
                        id_paquete: paquete_id,
                        id_comun: id_medicine
                    }
                    total = total + parseFloat(detalles[i].total)
                    DetallePaquete.create(datos_detalles)
                }
            }
            res.send(paquete);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });

    },

    // Aplica un paquete a la cuenta de un paciente:
    //  1) Cobra el paquete completo (paquetes.total) como UN cargo unico, tratado
    //     como consumo de material quirurgico (fila en detalle_consumo_quirugicos
    //     con id_paquete e id_quirurgico NULL).
    //  2) Registra los items del paquete como consumos en Q0 (no se cobran) y
    //     descuenta de existencia_actual_quirofano solo lo realmente consumido.
    //  3) Si de algun item se consume MAS que lo incluido, el excedente se cobra a
    //     precio normal del producto (como consumo individual adicional).
    //  4) Genera UN pedido de reposicion a farmacia con todas las lineas del paquete.
    // Todo el movimiento contable/inventario va en una transaccion.
    async aplicarACuenta(req, res) {
        const form = req.body.form || {};
        const idPaquete = form.id_paquete;
        const idCuenta = form.id_cuenta;
        const usuario = form.user;
        const consumos = form.consumos || [];

        if (!idPaquete || !idCuenta) {
            return res.status(400).json({ msg: 'Falta el id del paquete o de la cuenta' });
        }

        try {
            const resultado = await db.sequelize.transaction(async (t) => {
                const cuenta = await Cuenta.findOne({
                    where: { id: idCuenta, estado: 1 },
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });
                if (!cuenta) {
                    const e = new Error('No se encontró una cuenta activa para este paciente');
                    e.status = 400;
                    throw e;
                }

                const paquete = await Paquete.findByPk(idPaquete, { transaction: t });
                if (!paquete) {
                    const e = new Error('No se encontró el paquete');
                    e.status = 404;
                    throw e;
                }

                const detalles = await DetallePaquete.findAll({
                    where: { id_paquete: idPaquete },
                    transaction: t
                });

                const ahora = restarHoras(new Date(), 6);
                const totalPaquete = parseFloat(paquete.total) || 0;

                // Pre-cargar todos los productos por tipo (con lock) en 3 queries,
                // en vez de un findByPk por item (clave con paquetes grandes ~40 items).
                const idsPorTipo = { medicine: [], comun: [], quirurgico: [] };
                for (const det of detalles) {
                    const info = resolverTipo(det);
                    if (info) idsPorTipo[info.flag].push(info.idProd);
                }
                const medArr = idsPorTipo.medicine.length ? await Medicamento.findAll({ where: { id: idsPorTipo.medicine }, transaction: t, lock: t.LOCK.UPDATE }) : [];
                const comArr = idsPorTipo.comun.length ? await Comun.findAll({ where: { id: idsPorTipo.comun }, transaction: t, lock: t.LOCK.UPDATE }) : [];
                const quiArr = idsPorTipo.quirurgico.length ? await Quirurgico.findAll({ where: { id: idsPorTipo.quirurgico }, transaction: t, lock: t.LOCK.UPDATE }) : [];
                const prodMap = { medicine: {}, comun: {}, quirurgico: {} };
                medArr.forEach(p => { prodMap.medicine[p.id] = p; });
                comArr.forEach(p => { prodMap.comun[p.id] = p; });
                quiArr.forEach(p => { prodMap.quirurgico[p.id] = p; });

                // 1) Cargo unico del paquete como consumo quirurgico.
                await MovimientoQuirurgico.create({
                    id_quirurgico: null,
                    id_paquete: paquete.id,
                    descripcion: 'Paquete: ' + paquete.nombre + ' En el area de Quirofano',
                    cantidad: 1,
                    precio_venta: totalPaquete.toFixed(2),
                    total: totalPaquete.toFixed(2),
                    estado: 1,
                    id_cuenta: cuenta.id,
                    createdAt: ahora,
                    updatedAt: ahora,
                    created_by: usuario
                }, { transaction: t });

                let nuevoTotal = (parseFloat(cuenta.total) || 0) + totalPaquete;
                const lineasPedido = [];
                const movsMedicamento = [];
                const movsComun = [];
                const movsQuirurgico = [];
                // { tabla_producto: { id: cantidad_total_a_descontar } }
                const decrementos = { medicamentos: {}, comunes: {}, quirurgicos: {} };

                // 2) y 3) Items del paquete: se arman en memoria y se insertan en lote.
                for (const det of detalles) {
                    const info = resolverTipo(det);
                    if (!info) continue;
                    const producto = prodMap[info.flag][info.idProd];

                    const cantidadPaquete = parseInt(det.cantidad) || 0;
                    const cantidadReal = cantidadRealDe(det, consumos);
                    const incluida = Math.min(cantidadReal, cantidadPaquete);
                    const excedente = Math.max(0, cantidadReal - cantidadPaquete);

                    // Los medicamentos siempre son inventariados (no tienen ese campo).
                    const inventariado = info.flag === 'medicine'
                        ? true
                        : (producto && producto.inventariado === 'INVENTARIADO');
                    const movArr = info.flag === 'medicine' ? movsMedicamento : (info.flag === 'comun' ? movsComun : movsQuirurgico);

                    // 2a) Consumo incluido en el paquete: NO se cobra (Q0), solo inventario.
                    if (incluida > 0) {
                        movArr.push({
                            [info.idCol]: info.idProd,
                            descripcion: 'Incluido en paquete: ' + paquete.nombre + ' En el area de Quirofano',
                            cantidad: incluida,
                            precio_venta: 0,
                            total: 0,
                            estado: 1,
                            id_cuenta: cuenta.id,
                            createdAt: ahora,
                            updatedAt: ahora,
                            created_by: usuario
                        });
                    }

                    // 3) Excedente: se cobra a precio normal del producto.
                    if (excedente > 0) {
                        const precioNormal = parseFloat(producto.precio_venta) || 0;
                        const totalExc = precioNormal * excedente;
                        movArr.push({
                            [info.idCol]: info.idProd,
                            descripcion: 'Excedente de paquete: ' + paquete.nombre + ' En el area de Quirofano',
                            cantidad: excedente,
                            precio_venta: precioNormal.toFixed(2),
                            total: totalExc.toFixed(2),
                            estado: 1,
                            id_cuenta: cuenta.id,
                            createdAt: ahora,
                            updatedAt: ahora,
                            created_by: usuario
                        });
                        nuevoTotal += totalExc;
                    }

                    // Inventario a descontar (incluida + excedente = cantidadReal) y linea de reposicion.
                    if (inventariado && producto && cantidadReal > 0) {
                        const tabla = info.flag === 'medicine' ? 'medicamentos' : (info.flag === 'comun' ? 'comunes' : 'quirurgicos');
                        decrementos[tabla][info.idProd] = (decrementos[tabla][info.idProd] || 0) + cantidadReal;
                        lineasPedido.push({
                            is_medicine: info.flag === 'medicine',
                            is_quirurgico: info.flag === 'quirurgico',
                            is_comun: info.flag === 'comun',
                            id_medicine: det.id_medicamento,
                            id_quirurgico: det.id_quirurgico,
                            id_comun: det.id_comun,
                            cantidad: cantidadReal,
                            nombre: (producto && producto.nombre) ? producto.nombre : det.descripcion
                        });
                    }
                }

                // Inserta los consumos en lote (3 bulkCreate en vez de N inserts).
                if (movsMedicamento.length) await MovimientoMedicamentos.bulkCreate(movsMedicamento, { transaction: t });
                if (movsComun.length) await MovimientoComun.bulkCreate(movsComun, { transaction: t });
                if (movsQuirurgico.length) await MovimientoQuirurgico.bulkCreate(movsQuirurgico, { transaction: t });

                // Descuenta existencias con 1 UPDATE por tabla (CASE) en vez de N updates.
                // Los valores son enteros (parseInt), sin riesgo de inyeccion.
                for (const [tabla, mapa] of Object.entries(decrementos)) {
                    const ids = Object.keys(mapa);
                    if (!ids.length) continue;
                    const casos = ids.map(id => `WHEN ${parseInt(id, 10)} THEN ${parseInt(mapa[id], 10)}`).join(' ');
                    const idList = ids.map(id => parseInt(id, 10)).join(',');
                    await db.sequelize.query(
                        `UPDATE \`${tabla}\` SET \`existencia_actual_quirofano\` = \`existencia_actual_quirofano\` - CASE \`id\` ${casos} ELSE 0 END WHERE \`id\` IN (${idList})`,
                        { transaction: t }
                    );
                }

                await cuenta.update({ total: nuevoTotal.toFixed(2) }, { transaction: t });
                return { lineasPedido, nuevoTotal };
            });

            // 4) Un solo pedido de reposicion con todas las lineas del paquete
            //    (destino quirofano). Fuera de la transaccion; si falla no revierte
            //    el cargo, solo se registra (igual criterio que los consumos).
            if (resultado.lineasPedido.length > 0) {
                try {
                    const cantidadUnidades = resultado.lineasPedido.reduce((s, l) => s + parseInt(l.cantidad), 0);
                    await crearPedido({
                        codigoPedido: codigoQuirofano(),
                        fecha: restarHoras(new Date(), 6),
                        id_usuario: req.user ? req.user.user_id : null,
                        cantidadUnidades: cantidadUnidades,
                        picked: 1, // 1 = quirofano -> destino 2
                        detalle: resultado.lineasPedido
                    });
                } catch (e) {
                    console.log('Error creando pedido de reposicion del paquete:', e);
                }
            }

            return res.status(200).json({
                msg: 'El paquete ha sido aplicado a la cuenta',
                total_cuenta: resultado.nuevoTotal.toFixed(2)
            });
        } catch (error) {
            console.log(error);
            const status = error.status || 400;
            const msg = error.status ? error.message : 'Ha ocurrido un error, por favor intente más tarde';
            return res.status(status).json({ msg });
        }
    },


    // Edicion completa de un paquete: nombre, total y sus lineas (detalle_paquetes).
    // Reemplaza las lineas por las nuevas dentro de una transaccion. No afecta a
    // cuentas donde ya se cobro el paquete (esas guardan su propio total).
    async editar(req, res) {
        const { id, nombre, total, detalle } = req.body;
        if (!id) {
            return res.status(400).json({ msg: 'Falta el id del paquete' });
        }
        try {
            await db.sequelize.transaction(async (t) => {
                const paquete = await Paquete.findByPk(id, { transaction: t });
                if (!paquete) {
                    const e = new Error('No se encontró el paquete');
                    e.status = 404;
                    throw e;
                }
                await paquete.update({ nombre, total }, { transaction: t });
                await DetallePaquete.destroy({ where: { id_paquete: id }, transaction: t });

                const filas = (detalle || []).map(item => {
                    const fila = {
                        cantidad: item.cantidad,
                        descripcion: item.descripcion,
                        subtotal: item.total,
                        estado: 1,
                        id_paquete: id
                    };
                    if (item.is_medicine === true) fila.id_medicamento = item.id_medicine;
                    else if (item.is_quirurgico === true) fila.id_quirurgico = item.id_medicine;
                    else if (item.is_comun === true) fila.id_comun = item.id_medicine;
                    return fila;
                });
                await Promise.all(filas.map(f => DetallePaquete.create(f, { transaction: t })));
            });
            return res.status(200).json({ msg: 'El paquete ha sido actualizado' });
        } catch (error) {
            console.log(error);
            const status = error.status || 400;
            const msg = error.status ? error.message : 'Ha ocurrido un error, por favor intente más tarde';
            return res.status(status).json({ msg });
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

        var condition = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Paquete.findAndCountAll({ 
            include: [
                {
                    model: DetallePaquete,
                    require: true,
                },
                {
                    model: Usuarios,
                    require: true,
                },
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


    find (req, res) {
        const id = req.params.id;

        return Paquete.findByPk(id)
        .then(paquete => res.status(200).send(paquete))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Paquete.update(
            { nombre: form.nombre },
            { where: { 
                id: form.id 
            } }
        )
        .then(paquete => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    activate (req, res) {
        Paquete.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(paquete => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    deactivate (req, res) {
        Paquete.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(paquete =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    get (req, res) {
        Paquete.findAll({attributes: ['id', 'nombre']})
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
        var condition = busqueda?{ [Op.or]:[ {nombre: { [Op.like]: `%${busqueda}%` }}],[Op.and]:[{estado:1}] } : {estado:1} ;
        Paquete.findAll({
            include: [
                {
                    model: DetallePaquete,
                    require: true,
                },
                {
                    model: Usuarios,
                    require: true,
                },
            ],
            where: condition})
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    }
};

