'use strict';
const db = require('../../models');
const Op = db.Sequelize.Op;
const moment = require('moment');

const Cuenta = db.cuentas;
const Expediente = db.expedientes;
const Medico = db.medicos;
const DetalleHabitaciones = db.detalle_habitaciones;
const Habitaciones = db.habitaciones;
const Medicamento = db.medicamentos;
const Comun = db.comunes;
const Quirurgico = db.quirurgicos;
const Equipo = db.equipos;
const SalaOperaciones = db.servicio_sala_operaciones;
const Categoria = db.categoria_sala_operaciones;
const DetallePagoCuentas = db.detalle_pago_cuentas;
const PagoSeguros = db.pago_seguros;
const Seguro = db.seguros;
const Aseguradora = db.aseguradoras;
const Honorario = db.detalle_honorarios;
const MovMed = db.detalle_consumo_medicamentos;
const MovComun = db.detalle_consumo_comunes;
const MovQuir = db.detalle_consumo_quirugicos;

// Guatemala es fijo UTC-6 (sin horario de verano). Helpers para filtrar/mostrar
// timestamps guardados en UTC contra fechas locales.
const gtaUtc = (gtStr) => moment(gtStr, 'YYYY-MM-DD HH:mm:ss').add(6, 'hours').format('YYYY-MM-DD HH:mm:ss');
const utcAGt = (val) => (val ? moment.utc(val).utcOffset(-360).format('DD/MM/YYYY HH:mm') : '');
const num = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));

module.exports = {
  // 4) CENSO DIARIO de pacientes hospitalizados (Hospitalización + Intensivo).
  // Lista las estancias cuya habitación estuvo ocupada en el día indicado:
  // ingreso <= fin del día  Y  (salida NULL o salida >= inicio del día).
  async censoDiario(req, res) {
    try {
      const dia = req.query.dia;
      if (!dia) return res.status(400).json({ msg: 'Debe indicar el día (YYYY-MM-DD)' });

      const inicioUtc = gtaUtc(`${dia} 00:00:00`);
      const finUtc = gtaUtc(`${dia} 23:59:59`);

      // "Hospitalizado" = estancia de cuarto que se solapa con el día, en una
      // cuenta de hospitalización (cuenta.tipo = 1, que incluye Intensivo). No se
      // filtra por tipo_habitacion porque ese campo guarda el TIPO de cuarto
      // (Privada, Semi-privada, Intensivo, Emergencia...), no el área.
      const filas = await DetalleHabitaciones.findAll({
        where: {
          ingreso: { [Op.lte]: finUtc },
          [Op.or]: [
            { salida: null },
            { salida: { [Op.gte]: inicioUtc } }
          ]
        },
        include: [
          { model: Habitaciones, attributes: ['numero'], required: false },
          {
            model: Cuenta,
            attributes: ['id', 'numero'],
            required: true,
            where: { tipo: 1 },
            include: [{
              model: Expediente,
              attributes: ['nombres', 'apellidos', 'nacimiento'],
              required: true,
              include: [{ model: Medico, attributes: ['nombre'], required: false }]
            }]
          }
        ],
        order: [['ingreso', 'ASC']]
      });

      // Agrupar por cuenta: un paciente sale UNA vez aunque haya cambiado de
      // cuarto en el día; se listan todos los cuartos ocupados (traslados).
      // ingreso = estancia más temprana; egreso = salida más reciente (vacío si
      // sigue internado en alguna estancia abierta).
      const mapa = new Map();
      filas.forEach(f => {
        const p = f.get({ plain: true });
        const key = p.cuenta ? p.cuenta.id : ('sin-cuenta-' + p.id);
        const exp = (p.cuenta && p.cuenta.expediente) || {};
        if (!mapa.has(key)) {
          mapa.set(key, {
            paciente: `${exp.apellidos || ''} ${exp.nombres || ''}`.trim(),
            cuartos: new Set(),
            tipos: new Set(),
            edad: exp.nacimiento ? moment().diff(moment(exp.nacimiento, 'YYYY-MM-DD'), 'years') : '',
            medico: (exp.medico && exp.medico.nombre) ? exp.medico.nombre : '',
            ingresoMin: p.ingreso,
            salidaMax: p.salida,
            abierta: p.salida === null
          });
        }
        const g = mapa.get(key);
        if (p.habitacione && p.habitacione.numero) g.cuartos.add(p.habitacione.numero);
        if (p.tipo_habitacion) g.tipos.add(p.tipo_habitacion);
        if (p.ingreso && (!g.ingresoMin || p.ingreso < g.ingresoMin)) g.ingresoMin = p.ingreso;
        if (p.salida === null) g.abierta = true;
        else if (!g.salidaMax || p.salida > g.salidaMax) g.salidaMax = p.salida;
      });

      const data = [...mapa.values()].map((g, i) => ({
        no: i + 1,
        paciente: g.paciente,
        // Si no se registró el cuarto (id_habitacion NULL), se muestra el tipo de
        // habitación como referencia en vez de dejarlo en blanco.
        cuarto: g.cuartos.size ? [...g.cuartos].join(', ') : [...g.tipos].join(', '),
        edad: g.edad,
        medico: g.medico,
        ingreso: utcAGt(g.ingresoMin),
        egreso: g.abierta ? '' : utcAGt(g.salidaMax)
      }));

      const fechaTitulo = moment(dia, 'YYYY-MM-DD').locale('es').format('dddd, DD [DE] MMMM [DE] YYYY').toUpperCase();
      return res.json({ dia, fechaTitulo, total: data.length, data });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
    }
  },

  // 2) INVENTARIO GENERAL: medicamentos, quirúrgico, común y EQUIPO (cantidades).
  async inventarioGeneral(req, res) {
    try {
      const [meds, comunes, quirurgicos, equipos] = await Promise.all([
        Medicamento.findAll({ where: { estado: 1 }, attributes: ['nombre', 'existencia_actual'] }),
        Comun.findAll({ where: { estado: 1 }, attributes: ['nombre', 'existencia_actual'] }),
        Quirurgico.findAll({ where: { estado: 1 }, attributes: ['nombre', 'existencia_actual'] }),
        Equipo.findAll({ where: { estado: 1 }, attributes: ['nombre', 'existencia'] })
      ]);

      const map = (arr, tipo, campo) => arr.map(x => {
        const p = x.get({ plain: true });
        return { tipo, nombre: p.nombre, existencia: parseInt(p[campo]) || 0 };
      });

      const data = [
        ...map(meds, 'Medicamento', 'existencia_actual'),
        ...map(quirurgicos, 'Quirúrgico', 'existencia_actual'),
        ...map(comunes, 'Común', 'existencia_actual'),
        ...map(equipos, 'Equipo', 'existencia')
      ];

      return res.json({ total: data.length, data });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
    }
  },

  // 1) CUENTA DETALLADA de un paciente hospitalizado (con seguros).
  // Se elige la cuenta y se devuelve el desglose de cargos + pagos + seguros.
  async cuentaDetallada(req, res) {
    try {
      const idCuenta = req.query.id_cuenta;
      if (!idCuenta) return res.status(400).json({ msg: 'Debe indicar la cuenta' });

      const cuenta = await Cuenta.findByPk(idCuenta, {
        include: [{
          model: Expediente,
          attributes: ['expediente', 'nombres', 'apellidos', 'nacimiento'],
          include: [{ model: Medico, attributes: ['nombre'], required: false }]
        }]
      });
      if (!cuenta) return res.status(404).json({ msg: 'No se encontró la cuenta' });

      const [med, comun, quir, habitaciones, honorarios, cirugias, pagos, pagosSeguro, segurosExp] = await Promise.all([
        MovMed.findAll({ where: { id_cuenta: idCuenta, estado: 1 }, include: [{ model: Medicamento, attributes: ['nombre'], required: false }] }),
        MovComun.findAll({ where: { id_cuenta: idCuenta, estado: 1 }, include: [{ model: Comun, attributes: ['nombre'], required: false }] }),
        MovQuir.findAll({ where: { id_cuenta: idCuenta, estado: 1 }, include: [{ model: Quirurgico, attributes: ['nombre'], required: false }] }),
        DetalleHabitaciones.findAll({ where: { id_cuenta: idCuenta, estado: 1 }, attributes: ['tipo_habitacion', 'costo_base', 'ingreso', 'salida'] }),
        Honorario.findAll({ where: { id_cuenta: idCuenta, estado: 1 }, attributes: ['descripcion', 'total'], include: [{ model: Medico, attributes: ['nombre'], required: false }] }),
        SalaOperaciones.findAll({ where: { id_cuenta: idCuenta }, attributes: ['descripcion', 'horas', 'total'], include: [{ model: Categoria, attributes: ['categoria'], required: false }] }),
        DetallePagoCuentas.findAll({ where: { id_cuenta: idCuenta } }),
        PagoSeguros.findAll({ include: [{ model: DetallePagoCuentas, where: { id_cuenta: idCuenta }, attributes: [], required: true }, { model: Seguro, attributes: ['no_poliza', 'nombre_asegurado'], include: [{ model: Aseguradora, attributes: ['nombre'], required: false }] }] }),
        Seguro.findAll({ where: { id_expediente: cuenta.id_expediente }, attributes: ['no_poliza', 'nombre_asegurado', 'solvente'], include: [{ model: Aseguradora, attributes: ['nombre'], required: false }] })
      ]);

      const linea = (arr, prodKey) => arr.map(x => {
        const p = x.get({ plain: true });
        return {
          producto: (p[prodKey] && p[prodKey].nombre) ? p[prodKey].nombre : (p.descripcion || ''),
          cantidad: num(p.cantidad),
          precio_venta: num(p.precio_venta).toFixed(2),
          total: num(p.total).toFixed(2)
        };
      });

      const cargosConsumos = [...linea(med, 'medicamento'), ...linea(quir, 'quirurgico'), ...linea(comun, 'comune')];
      let totalCargos = cargosConsumos.reduce((s, x) => s + num(x.total), 0);

      const cargosHabitaciones = habitaciones.map(h => {
        const p = h.get({ plain: true });
        totalCargos += num(p.costo_base);
        return { tipo: p.tipo_habitacion, costo_base: num(p.costo_base).toFixed(2), ingreso: utcAGt(p.ingreso), salida: utcAGt(p.salida) };
      });
      const cargosHonorarios = honorarios.map(h => {
        const p = h.get({ plain: true });
        totalCargos += num(p.total);
        return { medico: (p.medico && p.medico.nombre) ? p.medico.nombre : '', descripcion: p.descripcion, total: num(p.total).toFixed(2) };
      });
      const cargosCirugias = cirugias.map(c => {
        const p = c.get({ plain: true });
        totalCargos += num(p.total);
        return { categoria: (p.categoria_sala_operacione && p.categoria_sala_operacione.categoria) ? p.categoria_sala_operacione.categoria : '', descripcion: p.descripcion, horas: p.horas, total: num(p.total).toFixed(2) };
      });

      const pagosData = pagos.map(pg => {
        const p = pg.get({ plain: true });
        return {
          efectivo: num(p.efectivo).toFixed(2), tarjeta: num(p.tarjeta).toFixed(2), deposito: num(p.deposito).toFixed(2),
          cheque: num(p.cheque).toFixed(2), seguro: num(p.seguro).toFixed(2), transferencia: num(p.transferencia).toFixed(2),
          total: num(p.total).toFixed(2)
        };
      });
      const segurosData = pagosSeguro.map(ps => {
        const p = ps.get({ plain: true });
        return {
          aseguradora: (p.seguro && p.seguro.aseguradora && p.seguro.aseguradora.nombre) ? p.seguro.aseguradora.nombre : '',
          poliza: (p.seguro && p.seguro.no_poliza) ? p.seguro.no_poliza : '',
          asegurado: (p.seguro && p.seguro.nombre_asegurado) ? p.seguro.nombre_asegurado : '',
          total: num(p.total).toFixed(2), pagado: num(p.pagado).toFixed(2), por_pagar: num(p.por_pagar).toFixed(2)
        };
      });
      const polizas = segurosExp.map(s => {
        const p = s.get({ plain: true });
        return { aseguradora: (p.aseguradora && p.aseguradora.nombre) ? p.aseguradora.nombre : '', poliza: p.no_poliza, asegurado: p.nombre_asegurado, solvente: p.solvente };
      });

      const cta = cuenta.get({ plain: true });
      const exp = cta.expediente || {};
      return res.json({
        cuenta: {
          numero: cta.numero, fecha_ingreso: cta.fecha_ingreso, tipo: cta.tipo,
          total: num(cta.total).toFixed(2), total_pagado: num(cta.total_pagado).toFixed(2),
          pendiente_de_pago: num(cta.pendiente_de_pago).toFixed(2), descuento: num(cta.descuento).toFixed(2)
        },
        paciente: {
          expediente: exp.expediente, nombre: `${exp.apellidos || ''} ${exp.nombres || ''}`.trim(),
          medico: (exp.medico && exp.medico.nombre) ? exp.medico.nombre : ''
        },
        cargos: { consumos: cargosConsumos, habitaciones: cargosHabitaciones, honorarios: cargosHonorarios, cirugias: cargosCirugias, total_cargos: totalCargos.toFixed(2) },
        pagos: pagosData,
        polizas: polizas,
        pagos_seguros: segurosData
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
    }
  },

  // EXTRA — Cuentas por cobrar: cuentas con saldo pendiente en un rango.
  async cuentasPorCobrar(req, res) {
    try {
      const { fechaInicio, fechaFin } = req.query;
      if (!fechaInicio || !fechaFin) return res.status(400).json({ msg: 'Debe indicar fechaInicio y fechaFin' });

      const cuentas = await Cuenta.findAll({
        where: {
          pendiente_de_pago: { [Op.gt]: 0 },
          fecha_ingreso: { [Op.between]: [fechaInicio, fechaFin] }
        },
        attributes: ['numero', 'fecha_ingreso', 'tipo', 'total', 'total_pagado', 'pendiente_de_pago'],
        include: [{ model: Expediente, attributes: ['expediente', 'nombres', 'apellidos'], required: true }],
        order: [['fecha_ingreso', 'ASC']]
      });

      let totalPendiente = 0;
      const data = cuentas.map(c => {
        const p = c.get({ plain: true });
        totalPendiente += num(p.pendiente_de_pago);
        return {
          numero: p.numero, fecha_ingreso: p.fecha_ingreso,
          paciente: `${p.expediente.apellidos || ''} ${p.expediente.nombres || ''}`.trim(),
          total: num(p.total).toFixed(2), total_pagado: num(p.total_pagado).toFixed(2), pendiente: num(p.pendiente_de_pago).toFixed(2)
        };
      });
      return res.json({ total: data.length, total_pendiente: totalPendiente.toFixed(2), data });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
    }
  },

  // EXTRA — Cirugías realizadas (sala de operaciones) por rango.
  async cirugiasRealizadas(req, res) {
    try {
      const { fechaInicio, fechaFin } = req.query;
      if (!fechaInicio || !fechaFin) return res.status(400).json({ msg: 'Debe indicar fechaInicio y fechaFin' });

      const cirugias = await SalaOperaciones.findAll({
        where: { createdAt: { [Op.between]: [`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`] } },
        attributes: ['descripcion', 'horas', 'total', 'createdAt'],
        include: [
          { model: Categoria, attributes: ['categoria'], required: false },
          { model: Cuenta, attributes: ['numero'], required: false, include: [{ model: Expediente, attributes: ['nombres', 'apellidos'], required: false, include: [{ model: Medico, attributes: ['nombre'], required: false }] }] }
        ],
        order: [['createdAt', 'ASC']]
      });

      let totalGeneral = 0;
      const data = cirugias.map(c => {
        const p = c.get({ plain: true });
        totalGeneral += num(p.total);
        const exp = (p.cuenta && p.cuenta.expediente) || {};
        return {
          fecha: utcAGt(p.createdAt),
          paciente: `${exp.apellidos || ''} ${exp.nombres || ''}`.trim(),
          medico: (exp.medico && exp.medico.nombre) ? exp.medico.nombre : '',
          categoria: (p.categoria_sala_operacione && p.categoria_sala_operacione.categoria) ? p.categoria_sala_operacione.categoria : '',
          descripcion: p.descripcion, horas: p.horas, total: num(p.total).toFixed(2)
        };
      });
      return res.json({ total: data.length, total_general: totalGeneral.toFixed(2), data });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
    }
  }
};
