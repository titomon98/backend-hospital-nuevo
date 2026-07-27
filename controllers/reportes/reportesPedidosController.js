'use strict'
const db = require("../../models");
const Op = db.Sequelize.Op;
const moment = require('moment');

// Config por tipo de consumo. El area NO es una columna: viene embebida en la
// descripcion del consumo ("... En el area de Quirofano/Hospitalizacion/...").
const CONFIG = {
    medicamentos: { Model: db.detalle_consumo_medicamentos, Producto: db.medicamentos, prodKey: 'medicamento' },
    comunes:      { Model: db.detalle_consumo_comunes,      Producto: db.comunes,      prodKey: 'comune' },
    quirurgicos:  { Model: db.detalle_consumo_quirugicos,   Producto: db.quirurgicos,  prodKey: 'quirurgico' }
};

// Areas validas tal como aparecen (sin tildes) dentro de la descripcion.
const AREAS_VALIDAS = ['Quirofano', 'Hospitalizacion', 'Intensivo', 'Emergencia'];

module.exports = {
    // Reporte de consumos por tipo, filtrado por area y por fecha.
    // Query:
    //   tipo         medicamentos | comunes | quirurgicos   (requerido)
    //   area         Quirofano | Hospitalizacion | Intensivo | Emergencia (opcional; vacio = todas)
    //   modo         rango | dia                            (requerido)
    //   fechaInicio  YYYY-MM-DD   (modo rango)
    //   fechaFin     YYYY-MM-DD   (modo rango)
    //   dia          YYYY-MM-DD   (modo dia)
    // El "dia" NO va de 00:00 a 23:59, sino de las 08:00 del dia elegido a las
    // 07:59:59 del dia siguiente (dia operativo del hospital).
    async getConsumos(req, res) {
        try {
            const tipo = req.query.tipo;
            const area = req.query.area;
            const modo = req.query.modo;

            const cfg = CONFIG[tipo];
            if (!cfg) {
                return res.status(400).json({ msg: 'Tipo de reporte invalido (medicamentos | comunes | quirurgicos)' });
            }

            // --- Ventana de fechas ---
            let desde, hasta;
            if (modo === 'dia') {
                const dia = req.query.dia;
                if (!dia) {
                    return res.status(400).json({ msg: 'Debe indicar el dia (YYYY-MM-DD)' });
                }
                const diaSiguiente = moment(dia, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
                desde = `${dia} 08:00:00`;
                hasta = `${diaSiguiente} 07:59:59`;
            } else if (modo === 'rango') {
                const fechaInicio = req.query.fechaInicio;
                const fechaFin = req.query.fechaFin;
                if (!fechaInicio || !fechaFin) {
                    return res.status(400).json({ msg: 'Debe indicar fecha inicial y final (YYYY-MM-DD)' });
                }
                desde = `${fechaInicio} 00:00:00`;
                hasta = `${fechaFin} 23:59:59`;
            } else {
                return res.status(400).json({ msg: 'Modo de fecha invalido (rango | dia)' });
            }

            // --- Condiciones ---
            const and = [
                { estado: { [Op.eq]: 1 } },
                { createdAt: { [Op.between]: [desde, hasta] } }
            ];
            // Filtro por area (opcional). Solo se aplica si es una de las validas.
            if (area && AREAS_VALIDAS.includes(area)) {
                and.push({ descripcion: { [Op.like]: `%${area}%` } });
            }

            const filas = await cfg.Model.findAll({
                where: { [Op.and]: and },
                include: [
                    { model: cfg.Producto, attributes: ['nombre'], required: false },
                    { model: db.cuentas, attributes: ['numero'], required: false }
                ],
                order: [['createdAt', 'ASC']]
            });

            let totalGeneral = 0;
            const data = filas.map(item => {
                const plain = item.get({ plain: true });
                const cantidad = parseFloat(plain.cantidad) || 0;
                const precio = parseFloat(plain.precio_venta) || 0;
                const total = parseFloat(plain.total) || 0;
                totalGeneral += total;
                return {
                    fecha: plain.createdAt ? moment.utc(plain.createdAt).format('DD/MM/YYYY HH:mm') : '',
                    producto: (plain[cfg.prodKey] && plain[cfg.prodKey].nombre) ? plain[cfg.prodKey].nombre : '',
                    cuenta: (plain.cuenta && plain.cuenta.numero) ? plain.cuenta.numero : '',
                    cantidad: cantidad,
                    precio_venta: precio.toFixed(2),
                    total: total.toFixed(2)
                };
            });

            return res.json({
                tipo,
                area: area || 'Todas',
                modo,
                desde,
                hasta,
                total_registros: data.length,
                total_general: totalGeneral.toFixed(2),
                data
            });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    }
};
