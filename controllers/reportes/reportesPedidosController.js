'use strict'
const db = require("../../models");
const Op = db.Sequelize.Op;
const moment = require('moment');

// Config por tipo: columna de id que identifica el producto en la linea.
const CONFIG = {
    medicamentos: { idCol: 'id_medicamento' },
    comunes:      { idCol: 'id_comun' },
    quirurgicos:  { idCol: 'id_quirurgico' }
};

// Areas validas = prefijo del codigoPedido de los pedidos automaticos de consumo.
const AREAS_VALIDAS = ['QUIROFANO', 'HOSPITALIZACION', 'INTENSIVO', 'EMERGENCIA'];

// Guatemala es fijo UTC-6 (sin horario de verano). Los timestamps de
// detalle_pedidos los guarda Sequelize en UTC, asi que para filtrar por un rango
// en hora local hay que sumar 6h a los limites (GT -> UTC).
const gtaUtc = (gtStr) => moment(gtStr, 'YYYY-MM-DD HH:mm:ss').add(6, 'hours').format('YYYY-MM-DD HH:mm:ss');
// Para mostrar: de UTC a hora de Guatemala (-360 min).
const utcAGt = (val) => (val ? moment.utc(val).utcOffset(-360).format('DD/MM/YYYY HH:mm') : '');

module.exports = {
    // Reporte de PEDIDOS YA SURTIDOS (detalle_pedidos.estado = 0), por tipo, area
    // y fecha. Query:
    //   tipo         medicamentos | comunes | quirurgicos   (requerido)
    //   area         QUIROFANO | HOSPITALIZACION | INTENSIVO | EMERGENCIA (opcional; vacio = todas)
    //   modo         rango | dia                            (requerido)
    //   fechaInicio  YYYY-MM-DD   (modo rango)
    //   fechaFin     YYYY-MM-DD   (modo rango)
    //   dia          YYYY-MM-DD   (modo dia)
    // El "dia" va de las 08:00 del dia elegido a las 07:59:59 del dia siguiente.
    // Se filtra por la fecha de SURTIDO (updatedAt, momento en que paso a estado 0).
    async getSurtidos(req, res) {
        try {
            const tipo = req.query.tipo;
            const modo = req.query.modo;
            const area = (req.query.area || '').toUpperCase();

            // tipo 'todos' incluye los tres; los demas deben existir en CONFIG.
            const cfg = tipo === 'todos' ? null : CONFIG[tipo];
            if (tipo !== 'todos' && !cfg) {
                return res.status(400).json({ msg: 'Tipo de reporte invalido (medicamentos | comunes | quirurgicos | todos)' });
            }

            // --- Ventana de fechas en hora de Guatemala ---
            let desdeGt, hastaGt;
            if (modo === 'dia') {
                const dia = req.query.dia;
                if (!dia) {
                    return res.status(400).json({ msg: 'Debe indicar el dia (YYYY-MM-DD)' });
                }
                const diaSiguiente = moment(dia, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
                desdeGt = `${dia} 08:00:00`;
                hastaGt = `${diaSiguiente} 07:59:59`;
            } else if (modo === 'rango') {
                const fechaInicio = req.query.fechaInicio;
                const fechaFin = req.query.fechaFin;
                if (!fechaInicio || !fechaFin) {
                    return res.status(400).json({ msg: 'Debe indicar fecha inicial y final (YYYY-MM-DD)' });
                }
                desdeGt = `${fechaInicio} 00:00:00`;
                hastaGt = `${fechaFin} 23:59:59`;
            } else {
                return res.status(400).json({ msg: 'Modo de fecha invalido (rango | dia)' });
            }

            // Limites convertidos a UTC para comparar contra los timestamps guardados.
            const desdeUtc = gtaUtc(desdeGt);
            const hastaUtc = gtaUtc(hastaGt);

            // --- Condiciones sobre la linea ---
            const and = [
                { estado: { [Op.eq]: 0 } },                 // surtido
                { updatedAt: { [Op.between]: [desdeUtc, hastaUtc] } }
            ];
            // Filtro por tipo (si no es 'todos').
            if (cfg) {
                and.push({ [cfg.idCol]: { [Op.ne]: null } });
            }

            // Filtro por area = prefijo del codigo del pedido (solo pedidos automaticos).
            const wherePedido = {};
            if (area && AREAS_VALIDAS.includes(area)) {
                wherePedido.codigoPedido = { [Op.like]: `${area}%` };
            }

            const filas = await db.detalle_pedidos.findAll({
                where: { [Op.and]: and },
                include: [
                    {
                        model: db.pedidos,
                        attributes: ['codigoPedido', 'fecha'],
                        required: true,
                        where: wherePedido
                    }
                ],
                order: [['updatedAt', 'ASC']]
            });

            let totalCantidad = 0;
            const data = filas.map(item => {
                const plain = item.get({ plain: true });
                const cantidad = parseInt(plain.cantidad) || 0;
                totalCantidad += cantidad;
                let tipoProducto = '';
                if (plain.id_medicamento) tipoProducto = 'Medicamento';
                else if (plain.id_comun) tipoProducto = 'Común';
                else if (plain.id_quirurgico) tipoProducto = 'Quirúrgico';
                return {
                    fecha: utcAGt(plain.updatedAt),
                    codigoPedido: (plain.pedido && plain.pedido.codigoPedido) ? plain.pedido.codigoPedido : '',
                    tipoProducto: tipoProducto,
                    producto: plain.descripcion || '',
                    cantidad: cantidad,
                    destino: plain.destino === 2 ? 'Quirófano' : 'Enfermería'
                };
            });

            return res.json({
                tipo,
                area: area || 'Todas',
                modo,
                desde: desdeGt,
                hasta: hastaGt,
                total_registros: data.length,
                total_cantidad: totalCantidad,
                data
            });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    }
};
