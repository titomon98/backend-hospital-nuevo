'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Movimientos = db.movimientos;
const Partida = db.partidas;
const Cuenta = db.cuenta_bancarias;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form
        
        const datos = {
            numero_movimiento: form.referencia,
            tipo: form.tipo,
            cantidad: form.cantidad,
            id_cuenta_bancaria: form.cuenta_bancaria.id,
            //id_partida: form.partida.id,
            estado: 1
        };
        if (form.tipo === 'DEBITO') {
            if (parseFloat(form.cantidad) <= parseFloat(form.cuenta_bancaria.cantidad)){
                let nuevo_saldo = parseFloat(form.cuenta_bancaria.cantidad) - parseFloat(form.cantidad)
                
                Movimientos.create(datos)
                .then(tipo => {
                    Cuenta.update({
                        cantidad: nuevo_saldo
                    },
                    {
                        where: {
                            id: form.cuenta_bancaria.id
                        }
                    })
                    .then(cuenta => res.status(200).json({ msg: 'Movimiento creado correctamente'}))
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
        } else if (form.tipo === 'CREDITO') { 
            let nuevo_saldo = parseFloat(form.cuenta_bancaria.cantidad) + parseFloat(form.cantidad)
            Movimientos.create(datos)
            .then(tipo => {
                Cuenta.update({
                    cantidad: nuevo_saldo
                },
                {
                    where: {
                        id: form.cuenta_bancaria.id
                    }
                })
                .then(cuenta => res.status(200).json({ msg: 'Movimiento creado correctamente'}))
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
    },

    create_partida (req, res) {
        let form = req.body.form
        let id_partida = req.body.id_partida
        
        const datos = {
            numero_movimiento: form.referencia,
            tipo: form.tipo,
            cantidad: form.cantidad,
            id_cuenta_bancaria: form.cuenta_bancaria.id,
            id_partida: id_partida,
            estado: 1
        };
        if (form.tipo === 'DEBITO') {
            if (parseFloat(form.cantidad) <= parseFloat(form.cuenta_bancaria.cantidad)){
                let nuevo_saldo = parseFloat(form.cuenta_bancaria.cantidad) - parseFloat(form.cantidad)
                
                Movimientos.create(datos)
                .then(tipo => {
                    Cuenta.update({
                        cantidad: nuevo_saldo
                    },
                    {
                        where: {
                            id: form.cuenta_bancaria.id
                        }
                    })
                    .then(cuenta => res.status(200).json({ msg: 'Movimiento creado correctamente'}))
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
        } else if (form.tipo === 'CREDITO') { 
            let nuevo_saldo = parseFloat(form.cuenta_bancaria.cantidad) + parseFloat(form.cantidad)
            Movimientos.create(datos)
            .then(tipo => {
                Cuenta.update({
                    cantidad: nuevo_saldo
                },
                {
                    where: {
                        id: form.cuenta_bancaria.id
                    }
                })
                .then(cuenta => res.status(200).json({ msg: 'Movimiento creado correctamente'}))
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

        Movimientos.findAndCountAll({ include: [
            {
                model: Cuenta,
                require: true,
            },
        ], where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
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

        return Movimientos.findByPk(id)
        .then(banco => res.status(200).send(banco))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Movimientos.update(
            { 
                numero_movimiento: form.numero_movimiento,
                tipo: form.tipo,
                cantidad: form.cantidad,
                id_cuenta_bancaria: form.cuenta_bancaria.id,
                id_partida: form.partida.id,    
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
        Movimientos.update(
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
        Movimientos.update(
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
        Movimientos.findAll({attributes: ['id', 'nombre']})
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
        Movimientos.findAll({
            where: condition})
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    getPartidas (req, res) {
        let id_partida = req.query.id_partida
        Movimientos.findAll({
            where: {id_partida: id_partida} })
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
};

