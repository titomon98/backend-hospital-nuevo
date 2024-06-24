'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Movimiento = db.detalle_consumo_comunes;
const Comun = db.comunes;
const Cuenta = db.cuentas;
const Op = db.Sequelize.Op;

module.exports = {
    async create(req, res) {
        const restarHoras = (fecha, horas) => {
            let nuevaFecha = new Date(fecha); // Crear una nueva instancia de fecha
            nuevaFecha.setHours(nuevaFecha.getHours() - horas);
            return nuevaFecha;
          };
        console.log("___________________Mov: ", req.body.form)
        const cuentas = await Cuenta.findAll({
            where: {
                id: req.body.form.id_cuenta
            },
            order: [['createdAt', 'DESC']]
          })
          let cuentaSeleccionada = null;
          for (const cuenta of cuentas) {
            if (cuenta.dataValues.estado == 1) {
              cuentaSeleccionada = cuenta;
              break;
            }
          }
          if (!cuentaSeleccionada) {
            return res.status(404).json({ msg: 'No se encontró ninguna cuenta activa para este expediente' });
          }
          const id_cuenta = cuentaSeleccionada.dataValues.id
          const numero_cuenta = cuentaSeleccionada.dataValues.numero
          let totalCuenta = cuentaSeleccionada.dataValues.total || 0
          let Total;
          let nuevoTotal;
        
          console.log(req.body.form.movimiento)
        let form = req.body.form
        let existencia_nueva = 0
        let descripcion;

        if (form.movimiento === 'SALIDAQ') {
            descripcion = 'Consumo de medicamentos por la cuenta ' + numero_cuenta + ' En el area de Quirofano'
        } else if (form.movimiento === 'SALIDAH') {
            descripcion = 'Consumo de medicamentos por la cuenta ' + numero_cuenta + ' En el area de Hospitalizacion'
        } else if (form.movimiento === 'SALIDAI'){
            descripcion = 'Consumo de medicamentos por la cuenta ' + numero_cuenta + ' En el area de Intensivo'
        } else if (form.movimiento === 'SALIDAE'){
            descripcion = 'Consumo de medicamentos por la cuenta ' + numero_cuenta + ' En el area de Emergencia'
        }

        existencia_nueva = parseInt(form.medicamento.existencia_actual) - parseInt(form.cantidad)
        Total = (parseFloat(form.cantidad) * parseFloat(form.medicamento.precio_venta))
        nuevoTotal = (parseFloat(totalCuenta) + parseFloat(Total))
        await cuentaSeleccionada.update({ total: nuevoTotal});
        const datos = {
            id_comun: form.medicamento.id,
            descripcion: descripcion,
            cantidad: form.cantidad,
            precio_venta: form.medicamento.precio_venta,
            total: Total,
            estado: form.state,
            id_cuenta: id_cuenta,
            createdAt: restarHoras(new Date(), 6),
            updatedAt: restarHoras(new Date(), 6),
        };
        Comun.update({ 
            existencia_actual: existencia_nueva
        },
        { where: { 
            id: form.medicamento.id 
        }})

        Movimiento.create(datos)
        .then(tipo => {
            
            res.send(tipo);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
                    
    }
}