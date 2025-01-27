'use strict';

const { Op, Sequelize } = require('sequelize');
const db = require('../../models');
const ExamenesRealizados = db.examenes_realizados;
const ExamenesAlmacenados = db.examenes_almacenados;
const Medicos = db.medicos;

module.exports = {
    // Reporte general de exámenes con el valor total de dinero que generaron, por fechas.
    async getReporteGeneralExamenes(req, res) {
      const { fechaInicio, fechaFin } = req.query;
      try {
          const examenesRealizados = await ExamenesRealizados.findAll({
              where: {
                  createdAt: { [Op.between]: [`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`] },
                  estado: { [Op.in]: [2, 3] }
              },
              attributes: ['id_examenes_almacenados', 'total'],
          });

          const idsExamenesAlmacenados = [...new Set(examenesRealizados.map(ex => ex.id_examenes_almacenados))];
          const examenesAlmacenados = await ExamenesAlmacenados.findAll({
              where: {
                  id: idsExamenesAlmacenados,
              },
              attributes: ['id', 'nombre'],
          });
  
          const reporte = examenesAlmacenados.map(examen => {
              const examenesRelacionados = examenesRealizados.filter(er => er.id_examenes_almacenados === examen.id);
              const totalGenerado = examenesRelacionados.reduce((sum, er) => sum + parseFloat(er.total), 0);
              return {
                  nombreExamen: examen.nombre,
                  fechaInicio,
                  fechaFin,
                  totalGenerado,
              };
          });
          reporte.sort((a, b) => b.totalGenerado - a.totalGenerado);
          res.json(reporte);
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Error al generar el reporte general de exámenes' });
      }
    },

    // Reporte de exámenes más realizados y menos realizados
    async getReporteExamenesMasMenosRealizados(req, res) {
        const { fechaInicio, fechaFin } = req.query;
        try {
            const examenes = await ExamenesRealizados.findAll({
                where: {
                    createdAt: { [Op.between]: [`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`] },
                },
                attributes: [
                    [Sequelize.fn('COUNT', Sequelize.col('id_examenes_almacenados')), 'cantidad']
                ],
                group: ['id_examenes_almacenados'],
                order: [[Sequelize.fn('COUNT', Sequelize.col('id_examenes_almacenados')), 'DESC']],
                include: [{ model: ExamenesAlmacenados, attributes: ['nombre'] }]
            });

            res.json(examenes);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al generar el reporte de exámenes más y menos realizados' });
        }
    },

    // Reporte de exámenes diarios (un día).
    async getReporteExamenesDiarios(req, res) {
        const { fechaInicio, fechaFin } = req.query
        try {
            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({ error: 'Debe proporcionar dos fechas: fechaInicio y fechaFin.' })
            }
    
            const examenes = await ExamenesRealizados.findAll({
                where: {
                    createdAt: {
                        [Op.between]: [`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`],
                    },
                },
                include: [
                    {
                        model: ExamenesAlmacenados,
                        attributes: ['nombre'],
                    },
                ],
                attributes: [
                    'expediente',
                    'total',
                    'createdAt',
                    'estado',
                ],
                order: [['createdAt', 'DESC']],
            });
    
            const datosFormateados = examenes.map((examen) => ({
                nombre_examen: examen.examenes_almacenado?.nombre || 'N/A',
                nombre_paciente: examen.expediente || 'Sin nombre',
                total: parseFloat(examen.total),
                fecha: examen.createdAt,
                estado: examen.estado,
            }));
    
            res.json(datosFormateados);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al generar el reporte de exámenes diarios' });
        }
    },

    // Reporte de exámenes por médico referente
    async getReporteExamenesPorMedico(req, res) {
        const { idMedico, fechaInicio, fechaFin } = req.query;
      
        try {
          const medico = await Medicos.findByPk(idMedico, { attributes: ['nombre'] });
          if (!medico) {
            return res.status(404).json({ error: 'Médico no encontrado' });
          }
      
          const nombreMedico = medico.nombre;

          const examenes = await ExamenesRealizados.findAll({
            where: {
              comision: nombreMedico,
              createdAt: { [Sequelize.Op.between]: [`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`] }
            },
            include: [
              {
                model: ExamenesAlmacenados,
                attributes: ['nombre'],
              }
            ],
            attributes: ['cui', 'total', 'estado', 'createdAt', 'expediente'],
          });
      
          if (!examenes.length) {
            return res.status(404).json({ error: 'No se encontraron exámenes para este médico en el rango de fechas especificado' });
          }

          const gruposPorCui = {};
          examenes.forEach((examen) => {
            const cui = examen.cui || 'Sin CUI';
            if (!gruposPorCui[cui]) {
              gruposPorCui[cui] = [];
            }
            gruposPorCui[cui].push({
              nombre_examen: examen.examenes_almacenado?.nombre || 'Desconocido',
              nombre_paciente: examen.expediente,
              total: parseFloat(examen.total),
              estado: examen.estado,
              fecha: examen.createdAt,
            });
          });

          const gruposOrdenados = Object.entries(gruposPorCui)
            .map(([cui, examenes]) => ({
              cui,
              total: examenes.reduce((sum, ex) => sum + ex.total, 0),
              examenes: examenes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
            }))
            .sort((a, b) => b.total - a.total);

          const reporte = gruposOrdenados.map((grupo) => ({
            cui: grupo.cui,
            total: grupo.total.toFixed(2),
            examenes: grupo.examenes.map((examen) => ({
              nombre_examen: examen.nombre_examen,
              nombre_paciente: examen.nombre_paciente,
              total: examen.total.toFixed(2),
              estado: examen.estado,
              fecha: examen.fecha,
            })),
          }));
      
          res.json(reporte);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Error al generar el reporte de exámenes por médico' });
        }
    },

    async getAllExamenesPorMedico(req, res) {
      const formatFecha = (fecha) => {
        const date = new Date(fecha);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };
      try {
        const examenes = await ExamenesRealizados.findAll({
          where: {
            estado: {
              [Sequelize.Op.in]: [2, 3]
            }
          },
          include: [
            {
              model: Medicos,
              attributes: ['nombre']
            },
            {
              model: ExamenesAlmacenados,
              attributes: ['nombre']
            }
          ],
          attributes: ['cui', 'total', 'estado', 'createdAt', 'expediente']
        });
    
        if (!examenes.length) {
          return res.status(404).json({ error: 'No se encontraron exámenes con estado 2 o 3' });
        }
    
        const reporte = examenes.map((examen) => ({
          nombre_medico: examen.medico?.nombre || 'Desconocido',
          nombre_examen: examen.examenes_almacenado?.nombre || 'Desconocido',
          nombre_paciente: examen.expediente,
          total: parseFloat(examen.total),
          fecha: formatFecha(examen.createdAt),
          estado: examen.estado
        }));
    
        res.json(reporte);
    
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el listado de exámenes por médico' });
      }
    }
            
};