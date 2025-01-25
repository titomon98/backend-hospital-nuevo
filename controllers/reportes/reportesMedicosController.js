'use strict';

const Sequelize = require('sequelize');
const { Op} = require('sequelize');
const db = require('../../models');
const HonorariosMedicos = db.detalle_honorarios
const HonorariosPagados = db.voucher_honorarios
const Cuentas = db.cuentas
const Expedientes = db.expedientes
const Medicos = db.medicos;
module.exports = {
    async reporteHonorarios(req, res) {
      const { fechaInicio, fechaFin } = req.query;
      try {
        const honorarios = await HonorariosMedicos.findAll({
            where: {
              createdAt: {
                    [Op.between]: [
                        `${fechaInicio} 00:00:00`,
                        `${fechaFin} 23:59:59`,
                    ],
                },
            },
            attributes: ['id_cuenta', 'id_medico', 'estado', 'descripcion', 'lugar', 'total', 'updatedAt'],
        });

        const idsCuentas = honorarios.map((item) => item.id_cuenta);
        const cuentas = await Cuentas.findAll({
            where: {
                id: {
                    [Op.in]: idsCuentas,
                },
            },
            attributes: ['id', 'id_expediente'],
            raw: true,
        });

        const idsExpedientes = cuentas.map((cuenta) => cuenta.id_expediente);
        const expedientes = await Expedientes.findAll({
            where: {
                id: {
                    [Op.in]: idsExpedientes,
                },
            },
            attributes: ['id', 'nombres', 'apellidos', 'expediente'],
            raw: true,
        });

        const ids = honorarios.map((honorario) => honorario.id_medico);
        const medicos = await Medicos.findAll({
            where: {
                id: ids,
            },
            attributes: ['id', 'nombre'],
        });

        const expedientesMap = expedientes.reduce((map, expediente) => {
            map[expediente.id] = expediente;
            return map;
        }, {});

        const medicosMap = medicos.reduce((map, medico) => {
            map[medico.id] = medico.nombre;
            return map;
        }, {});

        const honorariosFormateados = honorarios.map((detalle) => {
            const cuenta = cuentas.find((cuenta) => cuenta.id === detalle.id_cuenta);
            const expediente = cuenta ? expedientesMap[cuenta.id_expediente] : null;
            const nombreMedico = medicosMap[detalle.id_medico] || 'Nombre no especificado';

            return {
                id: detalle.id,
                id_medico: detalle.id_medico,
                nombre_medico: nombreMedico,
                paciente: expediente
                    ? `${expediente.nombres} ${expediente.apellidos}`
                    : 'Desconocido',
                expediente: expediente ? expediente.expediente : null,
                lugar: detalle.lugar,
                descripcion: detalle.descripcion,
                total_honorario: parseFloat(detalle.total),
                estado: detalle.estado === 1 ? 'Sin pagar' : 'Pagado',
                fecha: new Intl.DateTimeFormat('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                }).format(new Date(detalle.updatedAt)),
            };
        });

        const sinPagar = honorariosFormateados.filter((h) => h.estado === 'Sin pagar');
        const pagados = honorariosFormateados.filter((h) => h.estado === 'Pagado');

        const groupAndSortByMedico = (data) => {
            const grouped = data.reduce((map, item) => {
                if (!map[item.id_medico]) {
                    map[item.id_medico] = [];
                }
                map[item.id_medico].push(item);
                return map;
            }, {});

            return Object.values(grouped)
                .sort((a, b) => b.reduce((sum, h) => sum + h.total_honorario, 0) - 
                                a.reduce((sum, h) => sum + h.total_honorario, 0))
                .flat();
        };

        const sinPagarOrdenado = groupAndSortByMedico(sinPagar);
        const pagadosOrdenado = groupAndSortByMedico(pagados);

        res.json({
            sinPagar: sinPagarOrdenado,
            pagados: pagadosOrdenado,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al generar el reporte de honorarios' });
      }
    },

    async reporteMedicoMasHonorarios(req, res) {
      const { fechaInicio, fechaFin } = req.query;
    
      try {
        const honorarios = await HonorariosPagados.findAll({
          where: {
            updatedAt: {
              [Op.between]: [`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`],
            },
          },
          attributes: ['id_medico', 'nombre_medico', 'cantidad_pagada', 'fecha_creacion'],
        });
    
        if (!honorarios.length) {
          return res.status(404).json({
            mensaje: "No se encontraron honorarios en el rango de fechas especificado.",
          });
        }
    
        const honorariosPorMedico = honorarios.reduce((acumulador, honorario) => {
          const { id_medico, nombre_medico, cantidad_pagada, fecha_creacion } = honorario;
          if (!acumulador[id_medico]) {
            acumulador[id_medico] = {
              nombre_medico,
              total_honorarios: 0,
              fechas: [],
            };
          }
          acumulador[id_medico].total_honorarios += parseFloat(cantidad_pagada);
          acumulador[id_medico].fechas.push(fecha_creacion);
          return acumulador;
        }, {});
    
        const medicosOrdenados = Object.entries(honorariosPorMedico)
          .map(([id_medico, { nombre_medico, total_honorarios, fechas }]) => ({
            id_medico,
            nombre_medico,
            total_honorarios,
            fechas,
          }))
          .sort((a, b) => b.total_honorarios - a.total_honorarios);
    
        const reporte = medicosOrdenados.map((medico) => {
          return {
            nombre_medico: medico.nombre_medico || 'Nombre no especificado',
            total_honorarios: medico.total_honorarios,
            fechas: medico.fechas.map((fecha) => {
              const formattedDate = new Intl.DateTimeFormat('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).format(new Date(fecha));
              return formattedDate;
            }),
          };
        });
    
        const medicoConMasHonorarios = reporte[0] || null;
    
        res.json({
          medicoConMasHonorarios,
          listaDeMedicos: reporte,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al generar el reporte de honorarios' });
      }
    }    
    
};