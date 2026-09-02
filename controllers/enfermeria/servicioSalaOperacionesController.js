'use strict';

const Sequelize = require('sequelize');
const db = require('../../models');
const SalaOperaciones = db.servicio_sala_operaciones;
const Cuenta = db.cuentas;
const Categoria = db.categoria_sala_operaciones;
const Servicios = db.servicios;
const DetallePersonal = db.detalle_personals
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

// Mapea el nombre de categoria de sala a su id.
const idCategoriaDesdeNombre = (categoria) => ({
  'Cirugia menor': 1,
  'Cirugia media': 2,
  'Cirugia mayor': 3,
  'Parto': 4,
  'Legrado': 5
}[categoria] || null);

// Precio de un servicio adicional activo (oximetro / cauterio / monitor).
const precioServicioActivo = async (nombre) => {
  const servicios = await Servicios.findAll({
    where: { descripcion: { [Op.like]: `%${nombre}%` }, estado: 1 }
  });
  return (servicios && servicios[0]) ? parseFloat(servicios[0].precio) : 0;
};

// Calcula el total de una sala segun categoria, tiempo y adicionales. Fuente
// unica de verdad usada tanto al crear como al editar. Devuelve
// { total, id_categoria } o null si la categoria no existe o esta desactivada.
const calcularTotalSala = async ({ categoria, horas, minutos, oximetro, cauterio, monitor }) => {
  const id_categoria = idCategoriaDesdeNombre(categoria);
  if (!id_categoria) return null;
  const cat = await Categoria.findOne({ where: { id: id_categoria, estado: 1 } });
  if (!cat) return null;

  const hora = parseFloat(horas);
  const minuto = parseFloat(minutos);
  const precio = parseFloat(cat.precio);
  const cobroExtra = parseFloat(cat.cobro_extra);

  let totalCateg;
  if (hora == 2 && minuto > 30) {
    totalCateg = precio + cobroExtra;
  } else if (hora > 2) {
    totalCateg = precio + ((hora - 2) * cobroExtra);
  } else {
    totalCateg = precio; // hora <= 2 && minuto <= 30
  }

  let adicionales = 0;
  if (oximetro == true) adicionales += await precioServicioActivo('oximetro');
  if (cauterio == true) adicionales += await precioServicioActivo('cauterio');
  if (monitor == true) adicionales += await precioServicioActivo('monitor');

  return { total: totalCateg + adicionales, id_categoria };
};

module.exports = {
  async create(req, res) {

    const restarHoras = (fecha, horas) => {
      let nuevaFecha = new Date(fecha);
      nuevaFecha.setHours(nuevaFecha.getHours() - horas);
      return nuevaFecha;
    };
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
      return res.status(401).json({ msg: 'No se encontró ninguna cuenta activa para este expediente' });
    }
    const id_cuenta = cuentaSeleccionada.dataValues.id
    const numero_cuenta = cuentaSeleccionada.dataValues.numero
    let totalCuenta = cuentaSeleccionada.dataValues.total || 0

    const calculo = await calcularTotalSala({
      categoria: req.body.categoria,
      horas: req.body.horas,
      minutos: req.body.minutos,
      oximetro: req.body.oximetro,
      cauterio: req.body.cauterio,
      monitor: req.body.monitor
    });
    if (!calculo) {
      return res.status(402).json({ msg: 'La categoría de sala seleccionada no es válida o está desactivada' });
    }

    const Total = calculo.total;
    let nuevoTotal = (parseFloat(totalCuenta) + parseFloat(Total))
    const datos = {
      descripcion: `Se le sumo el total del uso de la sala de operaciones a la cuenta (${numero_cuenta})`,
      id_categoria: calculo.id_categoria,
      horas: req.body.horas + ':' + req.body.minutos,
      total: Total,
      oximetro: req.body.oximetro == true,
      cauterio: req.body.cauterio == true,
      monitor: req.body.monitor == true,
      id_cuenta: id_cuenta,
      createdAt: new Date(),
      updatedAt: restarHoras(new Date(), 6),
      created_by: req.user?.user ?? req.body.user.user
    };

    try {
      const nuevoDetalle = await SalaOperaciones.create(datos);
      await cuentaSeleccionada.update({ total: nuevoTotal});
      // El personal de sala ya no se guarda aqui: detalle_personals se relaciona
      // con el catalogo `servicios` (roles 9-14), no con servicio_sala_operaciones.
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
      const data = await SalaOperaciones.findAndCountAll({
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
      const detalle = await SalaOperaciones.findAll({
        where: {
          id_cuenta: {
            [Op.eq]: id,
          },
        },
        include: [Cuenta]
      });
      if (!detalle) {
        return res.status(400).json({ mensaje: 'Detalle de sala operaciones no encontrado' });
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
      const { count, rows } = await SalaOperaciones.findAndCountAll({
        where: { id_cuenta: idCuenta }, // Buscar por id_expediente
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

  // Edita una sala de operaciones ya cobrada. Solo roles 1 y 3. Permite corregir
  // el menu completo (categoria, tiempo, adicionales) recalculando el costo, y/o
  // fijar un total manual (para cobro extra o descuento). Ajusta el total de la
  // cuenta por la diferencia y deja auditoria en logs_ajuste_sala_operaciones.
  async editarTotal(req, res) {
    const { id, categoria, motivo } = req.body;
    const user = req.user?.user ?? req.body.user;
    const rol = parseInt(req.body.user_type);

    if (![1, 3].includes(rol)) {
      return res.status(403).json({ msg: 'No autorizado para editar la sala de operaciones' });
    }
    if (!id) {
      return res.status(400).json({ msg: 'Datos inválidos: se requiere el servicio' });
    }

    const t = await db.sequelize.transaction();
    try {
      const servicio = await SalaOperaciones.findByPk(id, { transaction: t });
      if (!servicio) { await t.rollback(); return res.status(404).json({ msg: 'Servicio de sala de operaciones no encontrado' }); }

      // Si viene el menu (categoria), recalcular el costo sugerido y actualizar
      // la configuracion (categoria, horas, adicionales) del servicio.
      let calculo = null;
      if (categoria) {
        calculo = await calcularTotalSala({
          categoria,
          horas: req.body.horas,
          minutos: req.body.minutos,
          oximetro: req.body.oximetro,
          cauterio: req.body.cauterio,
          monitor: req.body.monitor
        });
        if (!calculo) { await t.rollback(); return res.status(400).json({ msg: 'La categoría de sala seleccionada no es válida o está desactivada' }); }
      }

      // Total final: si mandan un total manual valido se respeta (cobro extra /
      // descuento); si no, se usa el recalculado del menu.
      const totalManual = parseFloat(req.body.total_nuevo);
      const totalNuevo = !isNaN(totalManual)
        ? totalManual
        : (calculo ? calculo.total : parseFloat(servicio.total));
      if (isNaN(totalNuevo) || totalNuevo < 0) {
        await t.rollback();
        return res.status(400).json({ msg: 'Total inválido' });
      }

      const totalAnterior = parseFloat(servicio.total) || 0;
      const diff = totalNuevo - totalAnterior;

      const cuenta = await Cuenta.findByPk(servicio.id_cuenta, { transaction: t, lock: t.LOCK.UPDATE });
      if (!cuenta) { await t.rollback(); return res.status(404).json({ msg: 'Cuenta no encontrada' }); }

      const nuevoTotalCuenta = (parseFloat(cuenta.total) || 0) + diff;

      let numeroExpediente = null;
      let nombrePaciente = null;
      let idExpediente = cuenta.id_expediente;
      if (idExpediente) {
        const expediente = await db.expedientes.findByPk(idExpediente, {
          attributes: ['expediente', 'nombres', 'apellidos'], transaction: t
        });
        if (expediente) {
          numeroExpediente = expediente.expediente;
          nombrePaciente = `${expediente.nombres} ${expediente.apellidos}`;
        }
      }

      const updateServicio = { total: totalNuevo, updated_by: user };
      if (calculo) {
        updateServicio.id_categoria = calculo.id_categoria;
        updateServicio.horas = `${req.body.horas}:${req.body.minutos}`;
        updateServicio.oximetro = req.body.oximetro == true;
        updateServicio.cauterio = req.body.cauterio == true;
        updateServicio.monitor = req.body.monitor == true;
      }

      await servicio.update(updateServicio, { transaction: t });
      await cuenta.update({ total: nuevoTotalCuenta.toFixed(2) }, { transaction: t });
      await db.logs_ajuste_sala_operaciones.create({
        id_servicio: servicio.id,
        id_cuenta: cuenta.id,
        id_expediente: idExpediente,
        numero_expediente: numeroExpediente,
        nombre_paciente: nombrePaciente,
        total_anterior: totalAnterior,
        total_nuevo: totalNuevo,
        motivo: motivo ?? null,
        created_by: user
      }, { transaction: t });

      await t.commit();
      return res.json({ ok: true, id: servicio.id, total_anterior: totalAnterior, total_nuevo: totalNuevo });
    } catch (error) {
      await t.rollback();
      console.log(error);
      return res.status(400).json({ msg: 'Ha ocurrido un error al editar la sala de operaciones' });
    }
  },

  // Lista los ajustes de sala de operaciones para monitoreo en Gerencia.
  async listAjustes(req, res) {
    const busqueda = req.query.search;
    const page = (parseInt(req.query.page) || 1) - 1;
    const size = parseInt(req.query.limit) || 25;
    const criterio = req.query.criterio || 'createdAt';
    const order = req.query.order || 'DESC';
    const limit = size;
    const offset = page > 0 ? page * limit : 0;

    const condition = busqueda
      ? { [Op.or]: [
          { nombre_paciente: { [Op.like]: `%${busqueda}%` } },
          { numero_expediente: { [Op.like]: `%${busqueda}%` } },
          { created_by: { [Op.like]: `%${busqueda}%` } },
          { motivo: { [Op.like]: `%${busqueda}%` } },
        ] }
      : {};

    try {
      const data = await db.logs_ajuste_sala_operaciones.findAndCountAll({
        where: condition,
        order: [[criterio, order]],
        limit,
        offset,
      });
      const totalPages = Math.ceil(data.count / limit);
      return res.send({
        total: data.count,
        last_page: totalPages,
        current_page: page + 1,
        from: page * limit + 1,
        to: page * limit + data.rows.length,
        data: data.rows,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
    }
  },
};
