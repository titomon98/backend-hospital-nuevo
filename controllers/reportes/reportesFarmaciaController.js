'use strict';

const { Op, Sequelize } = require('sequelize')
const db = require('../../models')
const DetalleConsumoComunes = db.detalle_consumo_comunes
const Comunes = db.comunes

const DetalleConsumoMedicamentos = db.detalle_consumo_medicamentos
const Medicamentos = db.medicamentos

const DetalleConsumoQuirurgicos = db.detalle_consumo_quirugicos
const Quirurgicos = db.quirurgicos

const Proveedores = db.proveedores
const Marcas = db.marcas
const Cuentas = db.cuentas
const Expedientes = db.expedientes

    module.exports = {

  // Reporte 1: Productos más utilizados
    async getProductosMasUtilizados(req, res) {
      const { fechaInicio, fechaFin } = req.query;
      try {
        const detalleConsumoComunes = await DetalleConsumoComunes.findAll({
            where: {
                updatedAt: {
                    [Op.between]: [
                        `${fechaInicio} 00:00:00`,
                        `${fechaFin} 23:59:59`,
                    ],
                },
            },
            attributes: [
                'id_comun',
                [Sequelize.fn('SUM', Sequelize.col('cantidad')), 'CantidadTotal'],
                [Sequelize.fn('SUM', Sequelize.col('total')), 'TotalVenta'],
            ],
            group: ['id_comun'],
            raw: true,
        });

        const detalleConsumo = await DetalleConsumoMedicamentos.findAll({
            where: {
                updatedAt: {
                    [Op.between]: [
                        `${fechaInicio} 00:00:00`,
                        `${fechaFin} 23:59:59`,
                    ],
                },
            },
            attributes: [
                'id_medicamento',
                [Sequelize.fn('SUM', Sequelize.col('cantidad')), 'CantidadTotal'],
                [Sequelize.fn('SUM', Sequelize.col('total')), 'TotalVenta'],
            ],
            group: ['id_medicamento'],
            raw: true,
        });

        const detalleConsumoQuirurgicos = await DetalleConsumoQuirurgicos.findAll({
            where: {
                updatedAt: {
                    [Op.between]: [
                        `${fechaInicio} 00:00:00`,
                        `${fechaFin} 23:59:59`,
                    ],
                },
            },
            attributes: [
                'id_quirurgico',
                [Sequelize.fn('SUM', Sequelize.col('cantidad')), 'CantidadTotal'],
                [Sequelize.fn('SUM', Sequelize.col('total')), 'TotalVenta'],
            ],
            group: ['id_quirurgico'],
            raw: true,
        });

        const idsComunes = detalleConsumoComunes.map((item) => item.id_comun);
        const comunes = await Comunes.findAll({
            where: {
                id: {
                    [Op.in]: idsComunes,
                },
            },
            attributes: ['id', 'nombre', 'precio_venta'],
            raw: true,
        });

        const idsMedicamentos = detalleConsumo.map((item) => item.id_medicamento);
        const medicamentos = await Medicamentos.findAll({
            where: {
                id: {
                    [Op.in]: idsMedicamentos,
                },
            },
            attributes: ['id', 'nombre', 'precio_venta'],
            raw: true,
        });

        const idsQuirurgicos = detalleConsumoQuirurgicos.map((item) => item.id_quirurgico);
        const quirurgicos = await Quirurgicos.findAll({
            where: {
                id: {
                    [Op.in]: idsQuirurgicos,
                },
            },
            attributes: ['id', 'nombre', 'precio_venta'],
            raw: true,
        });


        const reporteComunes = detalleConsumoComunes.map((detalle) => {
            const comun = comunes.find((med) => med.id === detalle.id_comun);
            return {
                id_comun: detalle.id_medicamento,
                nombre: comun ? comun.nombre : 'Desconocido',
                precio_unitario: comun ? comun.precio_venta : null,
                cantidad_total: parseFloat(detalle.CantidadTotal),
                total_venta: parseFloat(detalle.TotalVenta),
            };
        });
        reporteComunes.sort((a, b) => b.cantidad_total - a.cantidad_total);
        const masConsumidoComun = reporteComunes.length > 0 ? reporteComunes[0] : null;

        const reporteMedicamentos = detalleConsumo.map((detalle) => {
            const medicamento = medicamentos.find((med) => med.id === detalle.id_medicamento);
            return {
                id_medicamento: detalle.id_medicamento,
                nombre: medicamento ? medicamento.nombre : 'Desconocido',
                precio_unitario: medicamento ? medicamento.precio_venta : null,
                cantidad_total: parseFloat(detalle.CantidadTotal),
                total_venta: parseFloat(detalle.TotalVenta),
            };
        });
        reporteMedicamentos.sort((a, b) => b.cantidad_total - a.cantidad_total);
        const masConsumidoMedicamento = reporteMedicamentos.length > 0 ? reporteMedicamentos[0] : null;

        const reporteQuirurgicos = detalleConsumoQuirurgicos.map((detalle) => {
            const quirurgico = quirurgicos.find((med) => med.id === detalle.id_quirurgico);
            return {
                id_medicamento: detalle.id_medicamento,
                nombre: quirurgico ? quirurgico.nombre : 'Desconocido',
                precio_unitario: quirurgico ? quirurgico.precio_venta : null,
                cantidad_total: parseFloat(detalle.CantidadTotal),
                total_venta: parseFloat(detalle.TotalVenta),
            };
        });
        reporteQuirurgicos.sort((a, b) => b.cantidad_total - a.cantidad_total);
        const masConsumidoQuirurgicos = reporteQuirurgicos.length > 0 ? reporteQuirurgicos[0] : null;

        res.json({
            comunMasConsumido: masConsumidoComun,
            comunes: reporteComunes,

            medicamentoMasConsumido: masConsumidoMedicamento,
            medicamentos: reporteMedicamentos,

            quirurgicosMasConsumido: masConsumidoQuirurgicos,
            quirurgicos: reporteQuirurgicos,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al generar el reporte de medicamentos más consumidos' });
    }
    },

    // Reporte 2: Proveedores más solicitados
    async getProveedoresMasSolicitados(req, res) {

        const { fechaInicio, fechaFin } = req.query;
    
        try {
            const proveedorComunes = await Comunes.findAll({
                where: {
                    updatedAt: {
                        [Op.between]: [`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`],
                    },
                },
                attributes: [
                    'id_proveedor',
                    [Sequelize.fn('COUNT', Sequelize.col('id_proveedor')), 'conteo'],
                ],
                group: ['id_proveedor'],
                raw: true,
            });

            const proveedorMedicamentos = await Medicamentos.findAll({
                where: {
                    updatedAt: {
                        [Op.between]: [`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`],
                    },
                },
                attributes: [
                    'id_proveedor',
                    [Sequelize.fn('COUNT', Sequelize.col('id_proveedor')), 'conteo'],
                ],
                group: ['id_proveedor'],
                raw: true,
            });

            const proveedorQuirurgicos = await Quirurgicos.findAll({
                where: {
                    updatedAt: {
                        [Op.between]: [`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`],
                    },
                },
                attributes: [
                    'id_proveedor',
                    [Sequelize.fn('COUNT', Sequelize.col('id_proveedor')), 'conteo'],
                ],
                group: ['id_proveedor'],
                raw: true,
            });

            const totalProveedores = {};
            const sumarProveedores = (lista) => {
                lista.forEach((item) => {
                    const id = item.id_proveedor;
                    const conteo = parseInt(item.conteo, 10);
                    if (totalProveedores[id]) {
                        totalProveedores[id] += conteo;
                    } else {
                        totalProveedores[id] = conteo;
                    }
                });
            };
    
            sumarProveedores(proveedorComunes);
            sumarProveedores(proveedorMedicamentos);
            sumarProveedores(proveedorQuirurgicos);
    
            const idsProveedores = Object.keys(totalProveedores);
            const proveedores = await Proveedores.findAll({
                where: {
                    id: {
                        [Op.in]: idsProveedores,
                    },
                },
                attributes: ['id', 'nombre', 'representante', 'telefono'],
                raw: true,
            });
    
            const resultado = proveedores.map((proveedor) => ({
                ...proveedor,
                conteo: totalProveedores[proveedor.id],
            }));
    
            resultado.sort((a, b) => b.conteo - a.conteo);
            const proveedorMasSolicitado = resultado.length > 0 ? resultado[0] : null;
    
            res.status(200).json({
                resultado,
                proveedorMasSolicitado,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ocurrió un error al obtener los proveedores más solicitados.' });
        }
    },

    // Reporte 3: Inventario de todas las medicinas
    async getInventarioMedicinas(req, res) {
        try {
  
          const detalleInventario = await Medicamentos.findAll({
              attributes: [
                  'id',
                  'id_marca',
                  'nombre',
                  'precio_costo',
                  'precio_venta',
                  'existencia_actual',
                  'estado',
                  'existencia_actual_quirofano',
                  'existencia_actual_farmacia',
              ],
              group: ['id'],
              raw: true,
          });
  
          const idsMarcas = detalleInventario.map((item) => item.id_marca);
          const marcas = await Marcas.findAll({
              where: {
                  id: {
                      [Op.in]: idsMarcas,
                  },
              },
              attributes: ['id', 'nombre'],
              raw: true,
          });
  
          const reporteMedicamentos = detalleInventario.map((detalle) => {
              const marca = marcas.find((med) => med.id === detalle.id_marca);
              return {
                  id: detalle.id,
                  nombre_medicamento: detalle.nombre,
                  marca: marca? marca.nombre : 'desconocida',
                  precio_costo: parseFloat(detalle.precio_costo),
                  precio_venta: parseFloat(detalle.precio_venta),
                  existencia_actual: parseInt(detalle.existencia_actual),
                  estado: detalle.estado,
                  existencia_actual_quirofano: parseInt(detalle.existencia_actual_quirofano),
                  existencia_actual_farmacia: parseInt(detalle.existencia_actual_farmacia),
              };
          });
          reporteMedicamentos.sort((a, b) => a.existencia_actual - b.existencia_actual);
  
          res.json({
            medicamentos: reporteMedicamentos
          });
  
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Error al generar el reporte de medicamentos más consumidos' });
      }
    },

    // Reporte 4: inventario General
    async getInventarioGeneral(req, res) {
    try {

        const detalleInventario = await Medicamentos.findAll({
            attributes: [
                'id',
                'id_marca',
                'nombre',
                'existencia_actual',
                'estado',
            ],
            group: ['id'],
            raw: true,
        });

        const detalleInventario2 = await Comunes.findAll({
            attributes: [
                'id',
                'id_marca',
                'nombre',
                'existencia_actual',
                'estado',
            ],
            group: ['id'],
            raw: true,
        });

        const detalleInventario3 = await Quirurgicos.findAll({
            attributes: [
                'id',
                'id_marca',
                'nombre',
                'existencia_actual',
                'estado',
            ],
            group: ['id'],
            raw: true,
        });

        const idsMarcas = detalleInventario.map((item) => item.id_marca);
        const marcas = await Marcas.findAll({
            where: {
                id: {
                    [Op.in]: idsMarcas,
                },
            },
            attributes: ['id', 'nombre'],
            raw: true,
        });

        const idsMarcas2 = detalleInventario2.map((item) => item.id_marca);
        const marcas2 = await Marcas.findAll({
            where: {
                id: {
                    [Op.in]: idsMarcas2,
                },
            },
            attributes: ['id', 'nombre'],
            raw: true,
        })

        const idsMarcas3 = detalleInventario3.map((item) => item.id_marca);
        const marcas3 = await Marcas.findAll({
            where: {
                id: {
                    [Op.in]: idsMarcas3,
                },
            },
            attributes: ['id', 'nombre'],
            raw: true,
        })

        const reporteMedicamentos = detalleInventario.map((detalle) => {
            const marca = marcas.find((med) => med.id === detalle.id_marca);
            return {
                id: detalle.id,
                nombre: detalle.nombre,
                marca: marca? marca.nombre : 'desconocida',
                existencia_actual: parseInt(detalle.existencia_actual),
                estado: detalle.estado,
            };
        });
        reporteMedicamentos.sort((a, b) => a.existencia_actual - b.existencia_actual);

        const reporteComunes = detalleInventario2.map((detalle) => {
            const marca2 = marcas2.find((med) => med.id === detalle.id_marca);
            return {
                id: detalle.id,
                nombre: detalle.nombre,
                marca: marca2? marca2.nombre : 'desconocida',
                existencia_actual: parseInt(detalle.existencia_actual),
                estado: detalle.estado,
            };
        });
        reporteComunes.sort((a, b) => a.existencia_actual - b.existencia_actual);

        const reporteQuirurgicos = detalleInventario3.map((detalle) => {
            const marca3 = marcas3.find((med) => med.id === detalle.id_marca);
            return {
                id: detalle.id,
                nombre: detalle.nombre,
                marca: marca3? marca3.nombre : 'desconocida',
                existencia_actual: parseInt(detalle.existencia_actual),
                estado: detalle.estado,
            };
        });
        reporteQuirurgicos.sort((a, b) => a.existencia_actual - b.existencia_actual);

        res.json({
            comunes: reporteComunes,
            medicamentos: reporteMedicamentos,
            quirurgicos: reporteQuirurgicos

        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al generar el reporte de medicamentos más consumidos' });
    }
    },

    // Reporte 5: Suministro de Medicamentos a Pacientes
    async getMedicametosSuministrados(req, res) {
        const { fechaInicio, fechaFin } = req.query;
        try {
            const detalleConsumo = await DetalleConsumoMedicamentos.findAll({
                where: {
                    updatedAt: {
                        [Op.between]: [
                            `${fechaInicio} 00:00:00`,
                            `${fechaFin} 23:59:59`,
                        ],
                    },
                },
                attributes: [
                    [Sequelize.fn('DATE', Sequelize.col('updatedAt')), 'fecha'],
                    'id_medicamento',
                    'id_cuenta',
                    [Sequelize.fn('SUM', Sequelize.col('cantidad')), 'CantidadTotal'],
                    [Sequelize.fn('SUM', Sequelize.col('total')), 'TotalVenta'],
                ],
                group: ['fecha', 'id_cuenta', 'id_medicamento'],
                raw: true,
            });

            const idsMedicamentos = detalleConsumo.map((item) => item.id_medicamento);
            const idsCuentas = detalleConsumo.map((item) => item.id_cuenta);

            const medicamentos = await Medicamentos.findAll({
                where: {
                    id: {
                        [Op.in]: idsMedicamentos,
                    },
                },
                attributes: ['id', 'nombre', 'precio_venta'],
                raw: true,
            });

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

            // Crear un mapa de expedientes para acceso rápido
            const expedientesMap = expedientes.reduce((map, expediente) => {
                map[expediente.id] = expediente;
                return map;
            }, {});

            // Generar el reporte consolidado
            const reporteMedicamentos = detalleConsumo.map((detalle) => {
                const medicamento = medicamentos.find((med) => med.id === detalle.id_medicamento);
                const cuenta = cuentas.find((cuenta) => cuenta.id === detalle.id_cuenta);
                const expediente = cuenta ? expedientesMap[cuenta.id_expediente] : null;
                return {
                    fecha: detalle.fecha,
                    id_medicamento: detalle.id_medicamento,
                    nombre_medicamento: medicamento ? medicamento.nombre : 'Desconocido',
                    precio_unitario: medicamento ? medicamento.precio_venta : null,
                    cantidad_total: parseFloat(detalle.CantidadTotal),
                    total_venta: parseFloat(detalle.TotalVenta),
                    paciente: expediente
                        ? `${expediente.nombres} ${expediente.apellidos}`
                        : 'Desconocido',
                    cui: expediente ? expediente.expediente : null,
                };
            });

            // Ordenar el reporte del más reciente al más antiguo
            reporteMedicamentos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            res.json({ medicamentos: reporteMedicamentos });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al generar el reporte de medicamentos suministrados' });
        }
    },

};