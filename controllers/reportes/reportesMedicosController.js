'use strict';

const Sequelize = require('sequelize');
const { Op} = require('sequelize');
const db = require('../../models');
const HonorariosMedicos = db.detalle_honorarios;
const Medicos = db.medicos;
module.exports = {
    async reporteHonorarios(req, res) {
      const { fechaInicio, fechaFin } = req.query;
        try {
            const honorarios = await HonorariosMedicos.findAll({
                where: {
                    updatedAt: {
                      [Op.between]: [
                          `${fechaInicio} 00:00:00`,
                          `${fechaFin} 23:59:59`,
                      ],
                  },
                },
                attributes: ['id_medico', 'descripcion', 'total', 'updatedAt'],
            });

            const ids = honorarios.map((honorario) => honorario.id_medico);

            const medicos = await Medicos.findAll({
              where: {
                  id: ids,
              },
              attributes: ['id', 'nombre'],
          });

          const mapaHonorarios = medicos.reduce((mapa, medico) => {
            mapa[medico.id] = {
                nombre_medico: medico.nombre,
            };
            return mapa;
        }, {});

        const honorariosFormateados = honorarios.map((honorario) => {
          const medico = mapaHonorarios[honorario.id_medico] || {};
          return {
              nombre_medico: medico.nombre_medico || 'Nombre no especificado',
              descripcion: honorario.descripcion,
              total_honorario: Number(honorario.total).toFixed(2),
              fecha:new Intl.DateTimeFormat('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).format(new Date(honorario.updatedAt,)),
          };
      });
  
            res.json(honorariosFormateados);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al generar el reporte de pacientes fallecidos' });
        }
    },

    async reporteMedicoMasHonorarios(req, res) {
      const { fechaInicio, fechaFin } = req.query;
    
      try {
        const honorarios = await HonorariosMedicos.findAll({
          where: {
            updatedAt: {
              [Op.between]: [
                `${fechaInicio} 00:00:00`,
                `${fechaFin} 23:59:59`,
              ],
            },
          },
          attributes: ['id_medico', 'total', 'updatedAt'],
        });
    
        if (!honorarios.length) {
          return res.status(404).json({ mensaje: "No se encontraron honorarios en el rango de fechas especificado." });
        }
    
        const honorariosPorMedico = honorarios.reduce((acumulador, honorario) => {
          const { id_medico, total, updatedAt } = honorario;
          if (!acumulador[id_medico]) {
            acumulador[id_medico] = {
              total_honorarios: 0,
              fechas: [],
            };
          }
          acumulador[id_medico].total_honorarios += parseFloat(total);
          acumulador[id_medico].fechas.push(updatedAt);
          return acumulador;
        }, {});
    
        const medicosOrdenados = Object.entries(honorariosPorMedico)
          .map(([id_medico, { total_honorarios, fechas }]) => ({
            id_medico,
            total_honorarios,
            fechas,
          }))
          .sort((a, b) => b.total_honorarios - a.total_honorarios);
    
        const ids = medicosOrdenados.map((medico) => medico.id_medico);
    
        const medicos = await Medicos.findAll({
          where: {
            id: ids,
          },
          attributes: ['id', 'nombre'],
        });
    

        const reporte = medicosOrdenados.map((medico) => {
          const infoMedico = medicos.find((m) => m.id === parseInt(medico.id_medico)) || {};
          return {
            nombre_medico: infoMedico.nombre || 'Nombre no especificado',
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