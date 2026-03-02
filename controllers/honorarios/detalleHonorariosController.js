'use strict';

const Sequelize = require('sequelize');
const db = require('../../models');
const DetalleHonorarios = db.detalle_honorarios; // Asegúrate de que el nombre es correcto
const Medico = db.medicos;
const Cuenta = db.cuentas;
const Op = db.Sequelize.Op;
const Expediente = db.expedientes;
const moment = require('moment');

// ESTADOS DE DETALLE
// SIN PAGAR = 1
// PAGADO = 0
// Funciones auxiliares para paginación
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: items } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, items, totalPages, currentPage };
};

const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

module.exports = {
  async create(req, res) {

    console.log(req.body)

    const restarHoras = (fecha, horas) => {
      let nuevaFecha = new Date(fecha); // Crear una nueva instancia de fecha
      nuevaFecha.setHours(nuevaFecha.getHours() - horas);
      return nuevaFecha;
    };

    const idMedico = parseInt(req.body.id_medico, 10);
    if (isNaN(idMedico)) {
      return res.status(400).json({ msg: 'El id_medico debe ser un número entero' });
    }
    
    const cuentas = await Cuenta.findAll({
      where: {
          id: req.body.id_cuenta
      },
      order: [['createdAt', 'DESC']]
    })
    let cuentaSeleccionada = null;
    for (const cuenta of cuentas) {
      if (cuenta.dataValues.estado == 1) {
        cuentaSeleccionada = cuenta;
        break;
      }
    }
    if (!cuentaSeleccionada) {
      return res.status(400).json({ msg: 'No se encontró ninguna cuenta activa para este expediente' });
    }
    const id_cuenta = cuentaSeleccionada.dataValues.id
    let totalCuenta = cuentaSeleccionada.dataValues.total || 0;
    let nuevoTotal = (parseFloat(totalCuenta) + parseFloat(req.body.total))

    const datos = {
      id_medico: idMedico,
      id_cuenta: id_cuenta,
      estado: 1,
      lugar: req.body.lugar,
      descripcion: req.body.descripcion || null,
      total: req.body.total,
      createdAt: restarHoras(new Date(), 0),
      updatedAt: restarHoras(new Date(), 0),
      created_by: req.body.user
    };

    try {
      const nuevoDetalle = await DetalleHonorarios.create(datos);
      await cuentaSeleccionada.update({ total: nuevoTotal});
      res.send(nuevoDetalle);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
    }
  },

  async find(req, res) {
    const id = req.params.id;

    try {
      const detalle = await DetalleHonorarios.findByPk(id, { include: [Medico, Cuenta] });
      if (!detalle) {
        return res.status(400).json({ mensaje: 'Detalle de honorario no encontrado' });
      }
      res.status(200).send(detalle);
    } catch (error) {
      res.status(400).send(error);
    }
  },

  async getSearch(req, res) {
    const idCuenta = parseInt(req.query.search, 10); // Obtener el id_expediente de la consulta
    const page = parseInt(req.query.page, 10) || 1; // Página actual, con valor predeterminado de 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10; // Tamaño de página, con valor predeterminado de 10

    try {
      const { count, rows } = await DetalleHonorarios.findAndCountAll({
        where: { id_cuenta: idCuenta , estado : 1 }, // Buscar por id_expediente
        include: [{ model: db.medicos, as: 'medico' }], 
        limit: pageSize,
        offset: (page - 1) * pageSize
      });
  
      if (rows.length > 0) {
        const totalPages = Math.ceil(count / pageSize);
        res.send({
          from: (page - 1) * pageSize + 1,
          to: (page - 1) * pageSize + rows.length,
          total: count,
          last_page: totalPages,
          data: rows
        });
      } else {
        res.status(400).json({ msg: 'No se encontró ninguna cuenta para este expediente' });
      }
    } catch (error) {
      console.error("Error en getSearch:", error);
      return res.status(500).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
    }
  },

  async list(req, res) {
    const getPagingData = (data, page, limit) => {
        const { count: totalItems, rows: referido } = data;
        const currentPage = page ? +page : 0;
        const totalPages = Math.ceil(totalItems / limit);
        return { totalItems, referido, totalPages, currentPage };
    };
    const getPagination = (page, size) => {
        const limit = size ? +size : 2;
        const offset = page ? page * limit : 0;
        return { limit, offset };
    };
    
    const { page = 1, size = 20, criterio = 'createdAt', order = 'DESC' , fechaDesde, fechaHasta} = req.query;
    const Page=req.query.page-1;
    const Size=req.query.limit;
    const Criterio = req.query.criterio;
    const Order = req.query.order;
    const FechaDesde = req.query.fechaDesde;
    const FechaHasta = req.query.fechaHasta; 
    const { limit, offset } = getPagination(Page, Size);

    try {
        const whereClause = {};

        if (FechaDesde && FechaHasta) {
            whereClause.createdAt = {
                [Op.between]: [
                    moment(FechaDesde).startOf('day').toDate(), 
                    moment(FechaHasta).endOf('day').toDate()
                ]
            };
        }
        const data = await DetalleHonorarios.findAndCountAll({
            include: [
                { 
                  model: Cuenta, 
                  attributes: ['numero'],
                  include: [
                    {
                      model: Expediente, 
                      attributes: ['nombres', 'apellidos']
                    }
                  ] 
                },
                { model: Medico, attributes: ['id', 'nombre'] }
            ],
            attributes: ['id', 'descripcion', 'total', 'createdAt', 'created_by', 'updated_by', 'estado'],
            order: [[Criterio, Order]], // Ordenamos por createdAt DESC
            limit,
            offset,
            where: whereClause 
        }); 
        const response = getPagingData(data, Page, limit);
        if (response.referido) {
            const dataResponse = response.referido.map(item => ({
                id: item.id,
                numero_cuenta: item.cuenta.numero,
                nombre_medico: item.medico.nombre,
                total: item.total,
                fecha_honorario: item.createdAt,
                nombre_completo: item.cuenta.expediente.nombres + ' ' + item.cuenta.expediente.apellidos,
                created_by: item.created_by,
                updated_by: item.updated_by,
                estado: item.estado
            }));

            response.referido = dataResponse;
        } else {
            // Manejar el caso en que response.referido es undefined
            response.referido = []; // O enviar una respuesta adecuada al frontend
        }
        res.send({total:response.totalItems,last_page:response.totalPages, current_page: Page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
    } catch (error) {
        console.log(error);
        return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
    }
  },

  async deactivate(req, res) {
    const id_honorario = req.body.delete.id
    const responsable = req.body.delete.responsable

    const honorario = await DetalleHonorarios.findByPk(id_honorario);
    honorario.estado = 0
    honorario.updated_by = responsable
    await honorario.save();

    return res.send('Honorario eliminado correctamente')
  }    
};
