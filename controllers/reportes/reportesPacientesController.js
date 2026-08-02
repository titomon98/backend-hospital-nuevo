'use strict';

const db = require('../../models');
const Op = db.Sequelize.Op;
const Cuenta = db.cuentas;
const Expediente = db.expedientes;
const Medico = db.medicos;

module.exports = {
  // 3) ESTADÍSTICA DE PACIENTES: fecha, nombre del paciente y médico que atendió,
  // en un rango de fechas. La fecha es la fecha_ingreso de la cuenta; el médico es
  // el médico tratante del expediente (expedientes.id_medico).
  async estadisticaPacientes (req, res) {
    try {
      const { fechaInicio, fechaFin } = req.query;
      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({ msg: 'Debe indicar fechaInicio y fechaFin' });
      }

      const cuentas = await Cuenta.findAll({
        where: {
          fecha_ingreso: { [Op.between]: [fechaInicio, fechaFin] }
        },
        attributes: ['numero', 'fecha_ingreso', 'tipo'],
        include: [{
          model: Expediente,
          attributes: ['expediente', 'nombres', 'apellidos'],
          required: true,
          include: [{ model: Medico, attributes: ['nombre'], required: false }]
        }],
        order: [['fecha_ingreso', 'ASC']]
      });

      const data = cuentas.map(c => {
        const p = c.get({ plain: true });
        const exp = p.expediente || {};
        return {
          fecha: p.fecha_ingreso,
          numero_cuenta: p.numero,
          expediente: exp.expediente,
          paciente: `${exp.apellidos || ''} ${exp.nombres || ''}`.trim(),
          medico: (exp.medico && exp.medico.nombre) ? exp.medico.nombre : 'NO ASIGNADO'
        };
      });

      return res.json({ total: data.length, data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Error al generar la estadística de pacientes' });
    }
  }
};
