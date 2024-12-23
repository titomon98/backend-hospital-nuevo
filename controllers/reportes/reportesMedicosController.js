'use strict';

const Sequelize = require('sequelize');
const db = require('../../models');
const HonorariosMedicos = db.detalle_honorarios; // Importa el modelo de asuetos
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

            ids = honorarios.map((honorario) => honorario.id_medico);

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
              nombre_medico: medico.nombre_servicio || 'Nombre no especificado',
              descripcion: honorario.descripcion,
              total_honorario: honorario.total,
              fecha: honorario.updatedAt,
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
        // Obtener honorarios dentro del rango de fechas
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
    
        // Agrupar honorarios por médico y agregar fechas
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
    
        // Obtener IDs de médicos ordenados por el total acumulado de honorarios
        const medicosOrdenados = Object.entries(honorariosPorMedico)
          .map(([id_medico, { total_honorarios, fechas }]) => ({
            id_medico,
            total_honorarios,
            fechas,
          }))
          .sort((a, b) => b.total_honorarios - a.total_honorarios);
    
        const ids = medicosOrdenados.map((medico) => medico.id_medico);
    
        // Obtener información de los médicos ordenados por sus honorarios
        const medicos = await Medicos.findAll({
          where: {
            id: ids,
          },
          attributes: ['id', 'nombre'],
        });
    
        // Combinar nombres de médicos con sus totales y fechas
        const reporte = medicosOrdenados.map((medico) => {
          const infoMedico = medicos.find((m) => m.id === parseInt(medico.id_medico)) || {};
          return {
            nombre_medico: infoMedico.nombre || 'Nombre no especificado',
            total_honorarios: medico.total_honorarios,
            fechas: medico.fechas, // Fechas asociadas a los honorarios
          };
        });
    
        // Obtener el médico con más honorarios
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