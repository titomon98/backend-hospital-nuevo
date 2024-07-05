'use strict';

const Sequelize = require('sequelize');
const db = require('../../models');
const DetalleHonorarios = db.detalle_honorarios; // Asegúrate de que el nombre es correcto
const Medico = db.medicos;
const Cuenta = db.cuentas;
const Op = db.Sequelize.Op;


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
      descripcion: req.body.descripcion || null,
      total: req.body.total,
      createdAt: restarHoras(new Date(), 6),
      updatedAt: restarHoras(new Date(), 6),
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

  async list (req, res) {
    const { page = 1, size = 10, criterio = 'id', order = 'ASC', search = '' } = req.query;
    const { limit, offset } = getPagination(page - 1, size);
    const condition = search ? { descripcion: { [Op.like]: `%${search}%` } } : {};
  
    try {
      const data = await DetalleHonorarios.findAndCountAll({
        include: [{ model: Medico, required: true }],
        where: condition,
        order: [[criterio, order]],
        limit,
        offset,
      });
  
      const response = getPagingData(data, page - 1, limit);
      res.send(response);
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
    
    console.log("ID Expediente recibido:", idCuenta); 
    try {
      const { count, rows } = await DetalleHonorarios.findAndCountAll({
        where: { id_cuenta: idCuenta }, // Buscar por id_expediente
        include: [{ model: db.medicos, as: 'medico' }], 
        limit: pageSize,
        offset: (page - 1) * pageSize
      });
  
      console.log("Cuentas encontradas:", rows);
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

  async update(req, res) {
    let form = req.body.form;

    try {
      await DetalleHonorarios.update(
        {
          id_medico: form.id_medico,
          total: form.total,
          descripcion: form.descripcion,
          updatedAt: new Date(),
        },
        { where: { id: form.id } }
      );
      res.status(200).send('El registro ha sido actualizado');
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
    }
  },
};
