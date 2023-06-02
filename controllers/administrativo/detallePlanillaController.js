'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const DetallePlanillas = db.detalle_planillas;
const Planillas = db.planillas;
const Movimientos = db.movimientos;
const Cuenta = db.cuenta_bancarias;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form
        let cuenta = req.body.cuenta
        const datos = {
            descripcion: form.descripcion,
            fecha: form.fecha,
            num_cuenta: form.num_cuenta,
            salario: form.salario,
            bono: form.bono,
            igss: form.igss,
            isr: form.isr,
            prestamo: form.prestamo,
            liquido: form.liquido,
            nit: form.nit,
            id_planilla: form.id,
            estado: 1
        };

        const datos_movimiento = {
            numero_movimiento: cuenta.numero_movimiento,
            tipo: 'DEBITO',
            cantidad: form.liquido,
            id_cuenta_bancaria: cuenta.id,
            estado: 1
        }

        Cuenta.findOne({ where: { id: cuenta.id } })
        .then(cuenta_encontrada => {
            if (parseFloat(form.liquido) <= parseFloat(cuenta_encontrada.cantidad)){
                let nuevo_saldo = parseFloat(cuenta_encontrada.cantidad) - parseFloat(form.liquido)
                Movimientos.create(datos_movimiento)
                .then(tipo => {
                    Cuenta.update({
                        cantidad: nuevo_saldo
                    },
                    {
                        where: {
                            id: cuenta.id
                        }
                    })
                    .then(
                        DetallePlanillas.create(datos)
                        .then(tipo => {
                            res.status(200).json({ msg: 'Ingreso de toda la transacción correcta' })
                        })
                        .catch(error => {
                            console.log(error)
                            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
                        })
                    )
                    .catch(error => {
                        console.log(error)
                        return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
                    });
                })
                .catch(error => {
                    console.log(error)
                    return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
                });
                
            }
            else {
                return res.status(400).json({ msg: 'La cuenta no posee el saldo necesario' });
            }
        })
        .catch(err => {
            console.error('Error occurred while checking for code:', err);
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

        var condition = busqueda ? { [Op.or]: [{ nombre: { [Op.like]: `%${busqueda}%` } }] } : null ;

        DetallePlanillas.findAndCountAll({ where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
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

        return DetallePlanillas.findByPk(id)
        .then(banco => res.status(200).send(banco))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        DetallePlanillas.update(
            { 
                descripcion: form.descripcion,
                fecha: form.fecha,
                num_cuenta: form.num_cuenta,
                salario: form.salario,
                bono: form.bono,
                igss: form.igss,
                isr: form.isr,
                prestamo: form.prestamo,
                liquido: form.liquido,
                nit: form.nit,
                estado: 1  
            },
            { where: { 
                id: form.id 
            } }
        )
        .then(banco => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    activate (req, res) {
        DetallePlanillas.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(banco => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    deactivate (req, res) {
        DetallePlanillas.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(banco =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    get (req, res) {
        let id = req.query.id
        DetallePlanillas.findAll({ include: [
            {
                model: Planillas,
                as: 'planilla',
                require: true,
            },
        ], where: {
            id_planilla: id
          }})
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
        DetallePlanillas.findAll({
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

