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
            attributes: ['id', 'expediente', 'nombres', 'apellidos', 'nacimiento'],
            required: true,
            include: [{ model: Medico, attributes: ['nombre'], required: false }]
          },
          {
            model: DetalleHabitaciones,
            attributes: ['ingreso', 'salida', 'tipo_habitacion'],
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

      const planas = cuentas.map(c => c.get({ plain: true }));

      // Para cuentas cuyas estancias no tienen numero de cuarto (id_habitacion
      // NULL), recuperar el cuarto actual del paciente por habitaciones.ocupante
      // (mismo criterio que el sumario).
      const idsSinCuarto = planas
        .filter(p => !((p.detalle_habitaciones || []).some(d => d.habitacione && d.habitacione.numero)))
        .map(p => p.expediente && p.expediente.id)
        .filter(Boolean);
      const cuartoPorOcupante = {};
      if (idsSinCuarto.length) {
        const habs = await Habitaciones.findAll({
          where: { ocupante: { [Op.in]: idsSinCuarto } },
          attributes: ['ocupante', 'numero'],
          order: [['createdAt', 'DESC']]
        });
        habs.forEach(h => {
          const hp = h.get({ plain: true });
          if (cuartoPorOcupante[hp.ocupante] === undefined) cuartoPorOcupante[hp.ocupante] = hp.numero;
        });
      }

      const data = planas.map(p => {
        const exp = p.expediente || {};
        const dets = p.detalle_habitaciones || [];
        const numeros = [...new Set(dets.map(d => d.habitacione && d.habitacione.numero).filter(Boolean))];
        const tipos = [...new Set(dets.map(d => d.tipo_habitacion).filter(Boolean))];
        let cuartos = '';
        if (numeros.length) cuartos = numeros.join(', ');
        else if (cuartoPorOcupante[exp.id]) cuartos = cuartoPorOcupante[exp.id];
        else cuartos = tipos.join(', ');
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
