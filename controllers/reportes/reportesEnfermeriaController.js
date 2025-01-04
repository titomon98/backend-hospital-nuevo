'use strict';

const { Op, Sequelize } = require('sequelize')
const db = require('../../models')
const Expediente = db.expedientes
const Cuentas = db.cuentas
const LogTraslados = db.log_traslados
const SalaOperaciones = db.servicio_sala_operaciones
const Consumos = db.consumos
const Servicio = db.servicios
const DetalleConsumoMedicamentos = db.detalle_consumo_medicamentos
const Medicamentos = db.medicamentos
    module.exports = {

    // Reporte 1: Pacientes en cada lugar por fechas
  async getPacientesPorLugar(req, res) {
    const { fechaInicio, fechaFin } = req.query;

    try {
        const expedientes = await Expediente.findAll({
            where: {
                estado: { [Op.in]: [1, 3, 4, 5] },
                updatedAt: { [Op.between]: [`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`] },
            },
        });

        const traslados = await LogTraslados.findAll({
            where: {
                updatedAt: { [Op.between]: [`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`] },
            },
        });

        const registrosSalaOperaciones = await SalaOperaciones.findAll({
            where: {
                updatedAt: { [Op.between]: [`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`] },
            },
        });

        const cuentasIds = registrosSalaOperaciones.map((r) => r.id_cuenta);
        const cuentas = await Cuentas.findAll({ where: { id: cuentasIds } });
        const expedientesIds = cuentas.map((c) => c.id_expediente);
        const expedientesMap = await Expediente.findAll({
            where: { id: expedientesIds },
        });

        const expedientesIdsTraslados = traslados.map((c) => c.id_expediente);
        const expedientesMapTraslados = await Expediente.findAll({
            where: { id: expedientesIdsTraslados },
        });

        const lugares = {
            'Hospitalización': [],
            'Quirófano': [],
            'Intensivos': [],
            'Emergencia': [],
            'Sala de Operaciones': [],
        };

        const agregarPaciente = (idExpediente, nombres, apellidos, cui, fecha, lugar) => {
          lugares[lugar].push({ idExpediente, nombres, apellidos, cui, fecha });
        };

        expedientes.forEach(({ id_expediente, nombres, apellidos, cui, updatedAt, estado }) => {
            const lugar = { 1: 'Hospitalización', 3: 'Quirófano', 4: 'Intensivos', 5: 'Emergencia' }[estado];
            if (lugar) agregarPaciente(id_expediente, nombres, apellidos, cui, updatedAt, lugar);
        });

        traslados.forEach(({id_expediente, updatedAt, destino }) => {
          const expedienteTraslados = expedientesMapTraslados.find((e) => e.id === id_expediente);
          if (!expedienteTraslados) return;

          const { nombres, apellidos, cui } = expedienteTraslados;
          if (lugares[destino]) agregarPaciente(id_expediente, nombres, apellidos, cui, updatedAt, destino);
        });

        registrosSalaOperaciones.forEach(({ id_cuenta, updatedAt }) => {
            const cuenta = cuentas.find((c) => c.id === id_cuenta);
            if (!cuenta) return;

            const expediente = expedientesMap.find((e) => e.id === cuenta.id_expediente);
            if (!expediente) return;

            const { id_expediente, nombres, apellidos, cui } = expediente;
            agregarPaciente(id_expediente, nombres, apellidos, cui, updatedAt, 'Sala de Operaciones');
        });

        const respuesta = {
            cantidadHospitalizacion: lugares['Hospitalización'].length,
            cantidadQuirófano: lugares['Quirófano'].length,
            cantidadIntensivo: lugares['Intensivos'].length,
            cantidadEmergencia: lugares['Emergencia'].length,
            cantidadSalaOperaciones: lugares['Sala de Operaciones'].length,
            detalles: lugares,
        };

        res.json(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al generar el reporte de pacientes por lugar' });
    }
  },

  // Reporte 2: Pacientes actuales en cada lugar
  async getPacientesActuales(req, res) {
    try {
        const { fechaInicio, fechaFin } = req.query;
    
        if (!fechaInicio || !fechaFin) {
          return res.status(400).json({ error: 'Debe proporcionar fechaInicio y fechaFin' });
        }
        const expedientes = await Expediente.findAll({
          where: {
            updatedAt: {
              [Op.between]: [
                `${fechaInicio} 00:00:00`,
                `${fechaFin} 23:59:59`,
              ],
            },
          },
          attributes: ['id', 'estado', 'updatedAt', 'nombres', 'apellidos', 'cui'],
        });
        const conteoLugares = {
          Hospitalizacion: 0,
          Quirofano: 0,
          Intensivos: 0,
          Emergencia: 0,
        };

        const pacientesDetalle = [];

        expedientes.forEach((exp) => {
          const { estado, nombres, apellidos, cui,updatedAt } = exp;
    
          switch (estado) {
            case 1:
              conteoLugares.Hospitalizacion += 1;
              pacientesDetalle.push({ nombres, apellidos, cui, estado: 'Hospitalizacion',updatedAt });
              break;
            case 3:
              conteoLugares.Quirofano += 1;
              pacientesDetalle.push({ nombres, apellidos, cui, estado: 'Quirofano',updatedAt });
              break;
            case 4:
              conteoLugares.Intensivos += 1;
              pacientesDetalle.push({ nombres, apellidos, cui, estado: 'Intensivos',updatedAt });
              break;
            case 5:
              conteoLugares.Emergencia += 1;
              pacientesDetalle.push({ nombres, apellidos, cui, estado: 'Emergencia',updatedAt });
              break;
            default:
              break;
          }
        });
        res.json({
          fechaInicio,
          fechaFin,
          conteoLugares,
          pacientes: pacientesDetalle,
        });
      } catch (error) {
        console.error('Error al generar el reporte de pacientes por lugar:', error);
        res.status(500).json({ error: 'Error al generar el reporte de pacientes por lugar' });
      } 
  },

  // Reporte 3: Todos los pacientes por fechas
  async getTodosPacientesPorFechas(req, res) {
    const { fechaInicio, fechaFin } = req.query;
      try {
          const pacientes = await Expediente.findAll({
              where: {
                updatedAt: {
                    [Op.between]: [
                        `${fechaInicio} 00:00:00`,
                        `${fechaFin} 23:59:59`,
                    ],
                  },
              },
              attributes: ['nombres', 'apellidos', 'cui', 'estado', 'updatedAt'],
          });

          res.json(pacientes);
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Error al generar el reporte de todos los pacientes por fechas' });
      }
  },

  // Reporte 4: Servicios más consumidos
  async getServiciosMasConsumidos(req, res) {
    const { fechaInicio, fechaFin } = req.query;
    try {

      const consumos = await Consumos.findAll({
          where: {
              updatedAt: {
                  [Op.between]: [
                      `${fechaInicio} 00:00:00`,
                      `${fechaFin} 23:59:59`,
                  ],
              },
          },
          attributes: [
              [Sequelize.fn('SUM', Sequelize.col('cantidad')), 'Cantidad'],
              [Sequelize.fn('SUM', Sequelize.col('subtotal')), 'TotalConsumido'],
              'id_servicio',
              'descripcion',
          ],
          group: ['id_servicio', 'descripcion'],
          order: [[Sequelize.fn('SUM', Sequelize.col('cantidad')), 'DESC']],
      });

      const idsServicios = consumos.map((consumo) => consumo.id_servicio);

      const servicios = await Servicio.findAll({
          where: {
              id: idsServicios,
          },
          attributes: ['id', 'descripcion', 'precio'],
      });

      const mapaServicios = servicios.reduce((mapa, servicio) => {
          mapa[servicio.id] = {
              nombre_servicio: servicio.descripcion,
              precio_unitario: servicio.precio,
          };
          return mapa;
      }, {});

      const consumosFormateados = consumos.map((consumo) => {
          const servicio = mapaServicios[consumo.id_servicio] || {};
          return {
              nombre_servicio: servicio.nombre_servicio || 'Servicio no especificado',
              precio_unitario: servicio.precio_unitario || '0.00',
              descripcion: consumo.descripcion,
              cantidad: consumo.dataValues.Cantidad,
              total_consumido: consumo.dataValues.TotalConsumido,
          };
      });

      const consumoMasAlto = consumosFormateados[0] || null;

      res.json({
          consumos: consumosFormateados,
          consumoMasAlto,
      });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al generar el reporte de servicios más consumidos' });
    }
  },

  // Reporte 5: Medicamentos más consumidos
  async getMedicamentosMasConsumidos(req, res) {
      const { fechaInicio, fechaFin } = req.query;
      try {
        const detalleConsumo = await DetalleConsumoMedicamentos.findAll({
            where: {
                updatedAt: {
                    [Op.between]: [
                        `${fechaInicio} 00:00:00`,
                        `${fechaFin} 23:59:59`,
                    ],
                },
            },
            attributes: [
                'id_medicamento',
                [Sequelize.fn('SUM', Sequelize.col('cantidad')), 'CantidadTotal'],
                [Sequelize.fn('SUM', Sequelize.col('total')), 'TotalVenta'],
            ],
            group: ['id_medicamento'],
            raw: true,
        });

        const idsMedicamentos = detalleConsumo.map((item) => item.id_medicamento);

        const medicamentos = await Medicamentos.findAll({
            where: {
                id: {
                    [Op.in]: idsMedicamentos,
                },
            },
            attributes: ['id', 'nombre', 'precio_venta'],
            raw: true,
        });
        const reporte = detalleConsumo.map((detalle) => {
            const medicamento = medicamentos.find((med) => med.id === detalle.id_medicamento);
            return {
                id_medicamento: detalle.id_medicamento,
                nombre_medicamento: medicamento ? medicamento.nombre : 'Desconocido',
                precio_unitario: medicamento ? medicamento.precio_venta : null,
                cantidad_total: parseFloat(detalle.CantidadTotal),
                total_venta: parseFloat(detalle.TotalVenta),
            };
        });

        reporte.sort((a, b) => b.cantidad_total - a.cantidad_total);

        const masConsumido = reporte.length > 0 ? reporte[0] : null;

        res.json({
            mensaje: 'Reporte generado correctamente',
            mas_consumido: masConsumido,
            medicamentos: reporte,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al generar el reporte de medicamentos más consumidos' });
    }

    },

  // Reporte 6: Pacientes fallecidos
  async getPacientesFallecidos(req, res) {
    const { fechaInicio, fechaFin } = req.query;
      try {
          const pacientes = await Expediente.findAll({
              where: {
                  estado: 0,
                  updatedAt: {
                    [Op.between]: [
                        `${fechaInicio} 00:00:00`,
                        `${fechaFin} 23:59:59`,
                    ],
                },
              },
              attributes: ['nombres', 'apellidos', 'cui', 'estado', 'updatedAt'],
          });

          res.json(pacientes);
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Error al generar el reporte de pacientes fallecidos' });
      }
  },

  // Reporte 7: Pacientes egresados por tipo de egreso
  async getPacientesEgresados(req, res) {
    const { fechaInicio, fechaFin } = req.query;
      try {
          const pacientes = await Expediente.findAll({
              where: {
                estado: {
                  [Op.in]: [0, 6, 7, 8],
                },
                updatedAt: {
                  [Op.between]: [
                      `${fechaInicio} 00:00:00`,
                      `${fechaFin} 23:59:59`,
                  ],
                },
              },
              attributes: ['nombres', 'apellidos', 'cui', 'estado', 'updatedAt'],
          });

          res.json(pacientes);
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Error al generar el reporte de pacientes fallecidos' });
      }
  },
};