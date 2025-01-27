'use strict';

const Sequelize = require('sequelize');
const db = require('../../models');
const SalaOperaciones = db.servicio_sala_operaciones;
const Cuenta = db.cuentas;
const Categoria = db.categoria_sala_operaciones;
const Servicios = db.servicios;
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

    let id_categoria = null ;
    if (req.body.categoria == 'Cirugia menor'){
      id_categoria = 1
    } else if (req.body.categoria == 'Cirugia media'){
      id_categoria = 2
    } else if (req.body.categoria == 'Cirugia mayor'){
      id_categoria = 3
    } else if (req.body.categoria == 'Parto'){
      id_categoria = 4
    } else if (req.body.categoria == 'Legrado'){
      id_categoria = 5
    }

    const categorias = await Categoria.findAll({
      where: {
        id : id_categoria
      }
    })
    let categoriaselect = null;
    for (const categoria of categorias) {
      if (categoria.dataValues.estado == 1) {
        categoriaselect = categoria;
        break;
      }
    }
    if (!categoriaselect) {
      return res.status(402).json({ msg: 'La cuenta seleccionada esta desactivada o no se encuentra registrada' });
    }
    let hora = parseFloat(req.body.horas)
    let minuto = parseFloat(req.body.minutos)
    let TotalCateg = null;

    if (hora == 2 && minuto > 30 ) {
      TotalCateg = (parseFloat(categoriaselect.dataValues.precio) + parseFloat(categoriaselect.dataValues.cobro_extra))
    } else if (hora > 2 ){
      let multi = (hora - 2)
      let cobros_extra = (multi * parseFloat(categoriaselect.dataValues.cobro_extra))
      TotalCateg = (parseFloat(categoriaselect.dataValues.precio) + cobros_extra)
    } else if (hora <=2 && minuto <=30){
      TotalCateg = parseFloat(categoriaselect.dataValues.precio)
    }

   let Oximetro = req.body.oximetro;
   let Cauterio = req.body.cauterio;

    let PrecioServicios = 0;
    let precioOximetro = 0;
    let precioCauterio = 0;

    async function findServicio(descripcion, estado) {
      const servicios = await Servicios.findAll({
        where: {
          descripcion: {
            [Op.like]: `%${descripcion}%`,
          },
          estado: estado,
        },
      });
      return servicios;
    }

    if (Oximetro == true && Cauterio == true){
      const oximetroService = await findServicio('oximetro', 1); 
      const cauterioService = await findServicio('cauterio', 1); 
      if (oximetroService) {
          precioOximetro = parseFloat(oximetroService[0].precio);
        }
      if (cauterioService) {
          precioCauterio = parseFloat(cauterioService[0].precio);
        }

        PrecioServicios = precioOximetro + precioCauterio; //FIN IF
    } else if (Oximetro == true){
      const oximetroService = await findServicio('oximetro', 1);
      if (oximetroService) {
        precioOximetro = parseFloat(oximetroService[0].precio);;
      }
      PrecioServicios = precioOximetro;                     //FIN IF
    } else if (Cauterio == true){
      const cauterioService = await findServicio('cauterio', 1);
      if (cauterioService) {
        precioCauterio = parseFloat(cauterioService[0].precio);;
      }
      PrecioServicios = precioCauterio;                       //FIN IF 
    } else if (Oximetro == false && Cauterio == false){
      PrecioServicios = 0;
      precioOximetro = 0;
      precioCauterio = 0;
    }

    console.log('DATOS ---------------- ' + PrecioServicios + '-----------' + TotalCateg)

    let Total = (parseFloat(TotalCateg) + parseFloat(PrecioServicios));
    let nuevoTotal = (parseFloat(totalCuenta) + parseFloat(Total))

    const datos = {
      descripcion: `Sele sumo el total del uso de la sala de operaciones a la cuenta (${numero_cuenta})`,
      id_categoria: categoriaselect.dataValues.id,
      horas: req.body.horas + ':' + req.body.minutos,
      total: Total,
      id_cuenta: id_cuenta,
      createdAt: restarHoras(new Date(), 6),
      updatedAt: restarHoras(new Date(), 6),
    };

    console.log(datos)

    try {
      const nuevoDetalle = await SalaOperaciones.create(datos);
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
      const detalle = await SalaOperaciones.findByPk(id, { include: [ Cuenta] });
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
};
