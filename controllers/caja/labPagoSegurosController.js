'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Expediente = db.expedientes;
const Cuenta = db.cuentas;
const pagoSeguros= db.lab_pago_seguros;
const detalle_pago_cuenta= db.detalle_pago_cuentas;
const Op = db.Sequelize.Op;

module.exports={
    listAssuranceNoPay(req, res) {
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
    
        var condition = busqueda ? { [Op.or]: [{'seguro':{[Op.gte]:0}},{ '$Cuenta.Expediente.nombres$': { [Op.like]: `%${busqueda}%` }, '$Cuenta.Expediente.solvencia$': 0, [Op.or]:[{'$Cuenta.Expediente.estado$': 2},{'$Cuenta.Expediente.estado$': 6},{'$Cuenta.Expediente.estado$': 0}]}] } : {seguro:{[Op.gte]:0}, '$Cuenta.Expediente.solvencia$': 0, [Op.or]:[{'$Cuenta.Expediente.estado$': 2},{'$Cuenta.Expediente.estado$': 6},{'$Cuenta.Expediente.estado$': 0}]} ;
        console.log(busqueda)
        detalle_pago_cuenta.findAndCountAll({ 
            include: [
                {
                    model: Cuenta,
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
    }
};
