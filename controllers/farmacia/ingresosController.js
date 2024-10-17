'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Ingreso = db.ingresos;
const DetalleIngreso = db.detalle_ingresos;
const Usuarios = db.usuarios;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body
        const datos = {
            factura: form.factura,
            fecha: form.fecha,
            descripcion: form.descripcion,
            id_usuario: form.id_usuario,
            total: form.total,
            estado: 2,
            created_by: req.body.user,
        };

        Ingreso.create(datos)
        .then(ingreso => {
            const ingreso_id = ingreso.id
            let total = 0;
            let detalles = form.detalle
            let cantidad = form.detalle.length
            for (let i = 0; i < cantidad; i++){
                if (detalles[i].is_medicine === true){
                    let id_medicine = detalles[i].id_medicine
                    let datos_detalles = {
                        cantidad: detalles[i].cantidad,
                        descripcion: detalles[i].descripcion,
                        vencimiento: detalles[i].vencimiento,
                        subtotal: detalles[i].total,
                        estado: 2,
                        id_ingreso: ingreso_id,
                        id_medicamento: id_medicine
                    }
                    total = total + parseFloat(detalles[i].total)
                    DetalleIngreso.create(datos_detalles)
                }
                else if (detalles[i].is_quirurgico === true){
                    let id_medicine = detalles[i].id_medicine
                    let datos_detalles = {
                        cantidad: detalles[i].cantidad,
                        descripcion: detalles[i].descripcion,
                        vencimiento: detalles[i].vencimiento,
                        subtotal: detalles[i].total,
                        estado: 2,
                        id_ingreso: ingreso_id,
                        id_quirurgico: id_medicine
                    }
                    total = total + parseFloat(detalles[i].total)
                    DetalleIngreso.create(datos_detalles)
                }
                else if (detalles[i].is_comun === true){
                    let id_medicine = detalles[i].id_medicine
                    let datos_detalles = {
                        cantidad: detalles[i].cantidad,
                        descripcion: detalles[i].descripcion,
                        vencimiento: detalles[i].vencimiento,
                        subtotal: detalles[i].total,
                        estado: 2,
                        id_ingreso: ingreso_id,
                        id_comun: id_medicine
                    }
                    total = total + parseFloat(detalles[i].total)
                    DetalleIngreso.create(datos_detalles)
                }
            }
            res.send(ingreso);
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

        var condition = busqueda ? { [Op.or]: [{ descripcion: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Ingreso.findAndCountAll({ 
            include: [
                {
                    model: DetalleIngreso,
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

        return Ingreso.findByPk(id)
        .then(ingreso => res.status(200).send(ingreso))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Ingreso.update(
            { 
                factura: form.factura,
                fecha: form.fecha,
                descripcion: form.descripcion,
                updated_by: req.body.user,
            },
            { where: { 
                id: form.id 
            } }
        )
        .then(ingreso => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    activate (req, res) {
        Ingreso.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(ingreso => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    deactivate (req, res) {
        Ingreso.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(ingreso =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    async confirm (req, res) {
        const detalles = await DetalleIngreso.findAll({ where: { 
            id_ingreso: req.body.id 
        }});
        console.log(detalles)
        Ingreso.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            }}
        )
        .then(ingreso => {
            DetalleIngreso.update({ estado: 1 },
            { where: { 
                id_ingreso: req.body.id 
            }})
            detalles.forEach(element => {
                
            });
            res.status(200).send('El registro ha sido desactivado')
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    get (req, res) {
        Ingreso.findAll({attributes: ['id', 'nombre']})
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
        Ingreso.findAll({
            include: [
                {
                    model: DetalleIngreso,
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

