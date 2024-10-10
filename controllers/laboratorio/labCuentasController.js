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
        };

        Cuenta.create(datos)
        .then(tipo => {
            /* Expediente.update({
                solvente:1,
            },{
                where:{
                    id:form.id_expediente
                }
            }) */
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

        var condition = busqueda ? { [Op.or]: [{ '$Expediente.nombres$': { [Op.like]: `%${busqueda}%` } }, {'$Expediente.apellidos$':{[Op.like]: `%${busqueda}%`}}], 'estado':0 } : {'estado':0} ;
        //var condition = {'estado':0} ;

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

    listNoPay(req, res) {
        console.log('No pagados')
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

        /* var condition = busqueda ? {estado:1, [Op.or]: [{ '$Expediente.expediente$': { [Op.like]: `%${busqueda}%` }}] } : {estado:1} ;
         */
        var condition = {estado:1} ;
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
                { where: { 
                    id: req.body.id
                } }
            )
            .then((cuenta) =>{
                console.log(cuenta)
                Expediente.update(
                    {solvente: 0},
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
                        id_lab_cuenta: req.body.id
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
                        deposito: req.body.deposito,
                        cheque: req.body.cheque,
                        seguro: req.body.seguro,
                        transferencia: req.body.transferencia,
                        total: req.body.total,
                        tipo: req.body.tipo,
                        id_lab_cuenta: req.body.id
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
      }      
};

