'use strict';

const Sequelize = require('sequelize');
const db = require('../../models');
const Cuentas = db.cuentas;
const DetallePagoCuentas = db.detalle_pago_cuentas;
const Expediente = db.expedientes;
const Expedientes = db.expedientes;
const Op = db.Sequelize.Op;
const moment = require('moment');

module.exports = {
  // Obtener todos los asuetos
  async ingresosFechas (req, res) {
    let fechaInicial = req.query.fecha_inicio
    let fechaFinal = moment(req.query.fecha_final).add(1, 'days');
    try {
      const cuentas = await Cuentas.findAll({
        include:[
          {
            model: DetallePagoCuentas,
            require: true,
            attributes: [
              'efectivo',
              'tarjeta',
              'deposito',
              'cheque',
              'seguro',
              'transferencia'
            ]
          },
          {
            model: Expediente,
            require: true,
            attributes: [
              'expediente',
              'nombres',
              'apellidos'
            ]
          }
        ],
        attributes: [
          ['numero', 'numero_cuenta'], 
          'total_pagado',
          'total',
          'pendiente_de_pago',
          'descuento'
        ],
        where: { //se debe enviar la condicion con el operador antes de los objetos
          createdAt: {
              [Op.between]: [
                fechaInicial,
                fechaFinal
              ]
          }
        }
      });
      res.json(cuentas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los tipos de pago' });
    }
  },

  async ingresosDia (req, res) {
    let fechaInicial = req.query.fecha
    let fechaFinal = moment(fechaInicial).add(1, 'days');
    try {
      const cuentas = await Cuentas.findAll({
        include:[
          {
            model: DetallePagoCuentas,
            require: true,
            attributes: [
              'efectivo',
              'tarjeta',
              'deposito',
              'cheque',
              'seguro',
              'transferencia'
            ]
          },
          {
            model: Expediente,
            require: true,
            attributes: [
              'expediente',
              'nombres',
              'apellidos'
            ]
          }
        ],
        attributes: [
          ['numero', 'numero_cuenta'], 
          'total_pagado',
          'total',
          'pendiente_de_pago',
          'descuento'
        ],
        where: { //se debe enviar la condicion con el operador antes de los objetos
          createdAt: {
              [Op.between]: [
                fechaInicial,
                fechaFinal
              ]
          }
        }
      });
      res.json(cuentas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los tipos de pago' });
    }
  },

  async detalleMediosDePagoMesActual (req, res) {
    //No se reciben parametros porque es de todo
    let fechaInicial = req.query.fecha_inicio
    let fechaFinal = moment(req.query.fecha_final).add(1, 'days');
    try {
      const cuentas = await DetallePagoCuentas.findAll(
      {
        where: { //se debe enviar la condicion con el operador antes de los objetos
          createdAt: {
              [Op.between]: [
                fechaInicial,
                fechaFinal
              ]
          }
        }
      });
      let efectivo = 0.0
      let tarjeta = 0.0
      let deposito = 0.0
      let cheque = 0.0
      let seguro = 0.0
      let transferencia = 0.0

      if (cuentas.length > 0) {
        cuentas.forEach(element => {
          efectivo += parseFloat(element.dataValues.efectivo)
          tarjeta += parseFloat(element.dataValues.tarjeta)
          deposito += parseFloat(element.dataValues.deposito)
          cheque += parseFloat(element.dataValues.cheque)
          seguro += parseFloat(element.dataValues.seguro)
          transferencia += parseFloat(element.dataValues.transferencia)
        });
      }
      const totales = {
        efectivo: efectivo,
        tarjeta: tarjeta,
        deposito: deposito,
        cheque: cheque,
        seguro: seguro,
        transferencia: transferencia
      }
      res.json(totales);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener asuetos' });
    }
  },

  async simpleMediosDePago (req, res) {
    let fechaInicial = req.query.fecha_inicio
    let fechaFinal = moment(req.query.fecha_final).add(1, 'days');
    let tipo = req.query.tipo
    try {
      const cuentas = await DetallePagoCuentas.findAll(
      {
        where: { //se debe enviar la condicion con el operador antes de los objetos
          createdAt: {
              [Op.between]: [
                fechaInicial,
                fechaFinal
              ]
          }
        }
      });

      const campos = {
        efectivo: 'efectivo',
        tarjeta: 'tarjeta',
        deposito: 'deposito',
        cheque: 'cheque',
        seguro: 'seguro',
        transferencia: 'transferencia'
      };

      let total = 0.0

      if (cuentas.length > 0) {
        cuentas.forEach(element => {
          if (campos[tipo] === tipo) {
            total += parseFloat(element.dataValues[campos[tipo]]);
          }
        });
      }
      //Se veia muy simple solo el numero
      let totales = {
        total: total
      }

      res.json(totales);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener asuetos' });
    }
  },

  async mediosPagoPorPaciente(req, res) {
    let fechaInicial = req.query.fecha_inicio
    let fechaFinal = moment(req.query.fecha_final).add(1, 'days');

      try {
          const pagos = await DetallePagoCuentas.findAll({
            where: {
              createdAt: {
                  [Op.between]: [
                    fechaInicial,
                    fechaFinal
                  ]
              }
            }
          });

          const pagosAgrupados = {
              efectivo: [],
              tarjeta: [],
              deposito: [],
              cheque: [],
              transferencia: [],
              seguro: []
          };

        for (const pago of pagos) {
          const cuenta = await Cuentas.findOne({
              where: { id: pago.id_cuenta }
          });

          if (cuenta) {
              const expediente = await Expedientes.findOne({
                  where: { id: cuenta.id_expediente }
              });
              if (expediente) {
                  pago.nombreExpediente = `${expediente.nombres} ${expediente.apellidos}`;
              }
          }

          if (pago.efectivo !== null) {
              pagosAgrupados.efectivo.push({
                  NombreExpediente: pago.nombreExpediente || 'No disponible',
                  NumeroCuenta: pago.id_cuenta,
                  Tipo: pago.tipo,
                  Total: pago.total
              });
          } else if (pago.tarjeta !== null) {
              pagosAgrupados.tarjeta.push({
                  NombreExpediente: pago.nombreExpediente || 'No disponible',
                  NumeroCuenta: pago.id_cuenta,
                  Tipo: pago.tipo,
                  Total: pago.total
              });
          } else if (pago.deposito !== null) {
              pagosAgrupados.deposito.push({
                  NombreExpediente: pago.nombreExpediente || 'No disponible',
                  NumeroCuenta: pago.id_cuenta,
                  Tipo: pago.tipo,
                  Total: pago.total
              });
          } else if (pago.cheque !== null) {
              pagosAgrupados.cheque.push({
                  NombreExpediente: pago.nombreExpediente || 'No disponible',
                  NumeroCuenta: pago.id_cuenta,
                  Tipo: pago.tipo,
                  Total: pago.total
              });
          } else if (pago.transferencia !== null) {
            pagosAgrupados.transferencia.push({
                NombreExpediente: pago.nombreExpediente || 'No disponible',
                NumeroCuenta: pago.id_cuenta,
                Tipo: pago.tipo,
                Total: pago.total
            }); 
          } else if (pago.seguro !== null) {
              pagosAgrupados.seguro.push({
                  NombreExpediente: pago.nombreExpediente || 'No disponible',
                  NumeroCuenta: pago.id_cuenta,
                  Tipo: pago.tipo,
                  Total: pago.total
              });
          }
      }
      res.json(pagosAgrupados);
      } catch (error) {
          console.error('Error al obtener pagos por rango de fechas:', error);
          throw error;
      }
  }
};