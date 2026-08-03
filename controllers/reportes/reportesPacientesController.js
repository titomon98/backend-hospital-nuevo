'use strict';

const db = require('../../models');
const Op = db.Sequelize.Op;
const moment = require('moment');
const Cuenta = db.cuentas;
const Expediente = db.expedientes;
const Medico = db.medicos;
const DetalleHabitaciones = db.detalle_habitaciones;
const Habitaciones = db.habitaciones;

module.exports = {
  // 3) ESTADÍSTICA DE PACIENTES: fecha, paciente, no. de cuarto, edad, médico
  // tratante, ingreso y egreso (fecha/hora), en un rango de fechas.
  // Base: la CUENTA (cuentas.fecha_ingreso en el rango). El médico es el médico
  // tratante del expediente. El/los cuarto(s) salen de detalle_habitaciones (que
  // ya es el log de estancias por cuenta); si hubo traslado se listan todos.
  async estadisticaPacientes (req, res) {
    try {
      const { fechaInicio, fechaFin } = req.query;
      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({ msg: 'Debe indicar fechaInicio y fechaFin' });
      }

      const cuentas = await Cuenta.findAll({
        where: { fecha_ingreso: { [Op.between]: [fechaInicio, fechaFin] } },
        attributes: ['numero', 'fecha_ingreso', 'hora_ingreso', 'fecha_egreso', 'hora_egreso', 'tipo'],
        include: [
          {
            model: Expediente,
            attributes: ['expediente', 'nombres', 'apellidos', 'nacimiento'],
            required: true,
            include: [{ model: Medico, attributes: ['nombre'], required: false }]
          },
          {
            model: DetalleHabitaciones,
            attributes: ['ingreso', 'salida'],
            required: false,
            include: [{ model: Habitaciones, attributes: ['numero'], required: false }]
          }
        ],
        order: [['fecha_ingreso', 'ASC']]
      });

      const fmt = (f, h) => {
        if (!f) return '';
        const fecha = moment(f).format('DD/MM/YYYY');
        const hora = h ? String(h).slice(0, 5) : '';
        return (fecha + ' ' + hora).trim();
      };

      const data = cuentas.map(c => {
        const p = c.get({ plain: true });
        const exp = p.expediente || {};
        const dets = p.detalle_habitaciones || [];
        const cuartos = [...new Set(dets.map(d => d.habitacione && d.habitacione.numero).filter(Boolean))].join(', ');
        const edad = exp.nacimiento ? moment().diff(moment(exp.nacimiento, 'YYYY-MM-DD'), 'years') : '';
        return {
          fecha: p.fecha_ingreso,
          numero_cuenta: p.numero,
          paciente: `${exp.apellidos || ''} ${exp.nombres || ''}`.trim(),
          cuarto: cuartos,
          edad: edad,
          medico: (exp.medico && exp.medico.nombre) ? exp.medico.nombre : 'NO ASIGNADO',
          ingreso: fmt(p.fecha_ingreso, p.hora_ingreso),
          egreso: fmt(p.fecha_egreso, p.hora_egreso)
        };
      });

      return res.json({ total: data.length, data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Error al generar la estadística de pacientes' });
    }
  }
};
