'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Partidas = db.partidas;
const DetallePartidas = db.detalle_partidas;
const Nomenclaturas = db.nomenclaturas;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let cabecera = req.body.cabecera
        let detalles = req.body.detalle
        //Calcular total
        let total = cabecera.total_haber
        let iva = 0
        let monto = 0

        iva = total * 0.12
        monto = cabecera.total_haber - iva

        const datosPartida = {
            tipo: cabecera.tipo,
            descripcion: cabecera.name,
            fecha: cabecera.fecha,
            moneda: cabecera.moneda,
            tasa: cabecera.tasa,
            total: total,
            iva: iva,
            monto: monto,
            estado: 1
        };        

        Partidas.create(datosPartida)
        .then(partida => {
            const id_partida = partida.id;
            for (let i = 0; i < detalles.length; i++) {
                
                if (parseFloat(detalles[i].debe) === 0){
                    let datos_detalles = {
                        id_rubro: detalles[i].nomenclatura.id,
                        id_partida: id_partida,
                        estado: 1,
                        cantidad: detalles[i].haber,
                        posicion: 'HABER'
                    }
                    DetallePartidas.create(datos_detalles)
                }
                else if (parseFloat(detalles[i].haber) === 0){
                    let datos_detalles = {
                        id_rubro: detalles[i].nomenclatura.id,
                        id_partida: id_partida,
                        estado: 1,
                        cantidad: detalles[i].debe,
                        posicion: 'DEBE'
                    }
                    DetallePartidas.create(datos_detalles)
                }
            }
            
            res.status(200).json({ msg: 'Ingreso de partida correcto' });
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
        const columna = req.query.columna;


        const { limit, offset } = getPagination(page, size);

        var condition = busqueda ? { [Op.or]: [{ [columna]: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Partidas.findAndCountAll({ include: [
            {
                model: DetallePartidas,
                require: true,
                include: [
                    {
                        model: Nomenclaturas,
                        require: true,
                    },
                ]
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
        const id = req.query.id;

        return Partidas.findOne({ include: [
            {
                model: DetallePartidas,
                require: true,
                include: [
                    {
                        model: Nomenclaturas,
                        require: true
                    }
                ]
            },
        ], where: { id: id }
        })
        .then(partida => {
            res.status(200).send(partida)
        })
        .catch(error => {
            console.log(error)
            res.status(400).send(error)
        })
    },
    // findDetalle (req, res) {
    //     const id = req.query.id;

    //     return DetallePartidas.find({})
    //     .then(partidas => res.status(200).send(partidas))
    //     .catch(error => res.status(400).send(error))
    // },

    update (req, res) {
        let form = req.body.form
        Partidas.update(
            { nombre: form.name },
            { where: { 
                id: form.id 
            } }
        )
        .then(partidas => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    activate (req, res) {
        Partidas.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(partidas => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    deactivate (req, res) {
        Partidas.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(partidas =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    get (req, res) {
        Partidas.findAll({attributes: ['id', 'nombre']})
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
        Partidas.findAll({
            where: condition})
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    getEspecifico (req, res) {
        const fechas = req.body
        //Tomar fecha de hoy
        const TODAY_START = fechas.start;
        const TOMORROW = fechas.end;
        
        Partidas.findAll({ 
            include: [
                {
                    model: DetallePartidas,
                    as: 'detalle_partidas',
                    require: true,
                },
            ],
            where: {
                fecha: { [Sequelize.Op.between]: [TODAY_START, TOMORROW] } // use the "between" operator
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
    getDiario (req, res) {
        const fechas = req.body
        //Tomar fecha de hoy
        const TODAY_START = fechas.start;
        const TOMORROW = fechas.end;
        
        Partidas.findAll({ 
            include: [
                {
                    model: DetallePartidas,
                    as: 'detalle_partidas',
                    require: true,
                    attributes: ['id', 'posicion', 'cantidad'],
                    include: [
                        {
                            model: Nomenclaturas,
                            require: true,
                            attributes: ['id', 'nombre']
                        },
                    ],
                },
            ],
            attributes: ['id', 'fecha', 'total', 'descripcion', 'moneda', 'tasa', 'total'],
            where: {
                fecha: { [Sequelize.Op.between]: [TODAY_START, TOMORROW] }, // use the "between" operator
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
    
    
};

