'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
//const Contrato = db.contratos;
const Asueto = db.asuetos
const Categoria = db.categoria_sala_operaciones;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form
        const datos = {
            categoria: form.categoria,
            precio: form.precio,
            cobro_extra: form.cobro_extra,
            estado: 1,
            created_by: req.body.user
        };

        Categoria.create(datos)
        .then(tipo => {
            res.send(tipo);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
                    
    },

 
    list(req, res) {
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

        const busqueda=req.query.search;
        const page=req.query.page-1;
        const size=req.query.limit;
        const criterio=req.query.criterio;
        const order=req.query.order;


        const { limit, offset } = getPagination(page, size);

        var condition = busqueda ? { [Op.or]: [{ categoria: { [Op.like]: `%${busqueda}%` } }] } : null ;

        Categoria.findAndCountAll({ where: condition,order:[[`${criterio}`,`${order}`]],limit,offset})
        .then(data => {

        console.log('data: '+JSON.stringify(data))
        const response = getPagingData(data, page, limit);

        console.log('response: '+JSON.stringify(response))
        res.send({total:response.totalItems,last_page:response.totalPages, current_page: page+1, from:response.currentPage,to:response.totalPages,data:response.referido});
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },


    find (req, res) {
        const id = req.params.id;

        return Categoria.findByPk(id)
        .then(marca => res.status(200).send(marca))
        .catch(error => res.status(400).send(error))
    },

    update (req, res) {
        let form = req.body.form
        Categoria.update(
            { 
                categoria: form.categoria,
                precio: form.precio,
                cobro_extra: form.cobro_extra,
                estado: form.estado,
                updated_by: req.body.user
            },
            { where: { 
                id: form.id 
            } }
        )
        .then(marca => res.status(200).send('El registro ha sido actualizado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    activate (req, res) {
        Categoria.update(
            { estado: 1 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(marca => res.status(200).send('El registro ha sido activado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    deactivate (req, res) {
        Categoria.update(
            { estado: 0 },
            { where: { 
                id: req.body.id 
            } }
        )
        .then(marca =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
    getId (req, res) {
        Categoria.findAll({attributes: ['id', 'categoria']})
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },

    getSearch (req, res) {
        const busqueda = req.query.search;
        const condition = busqueda
          ? {
              [Op.and]: [
                {
                  [Op.or]: [{ categoria: { [Op.like]: `%${busqueda}%` } }],
                },
                { estado: 1 },
              ],
            }
          : { estado: 1 };
      
        // Obtener fecha y hora actuales
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString("en-CA");
      
        const isSaturdayAfter1PM =
          currentDate.getDay() === 6 &&
          (currentDate.getHours() >= 13);
        
        // Consultar días de asueto
        Asueto.findOne({ where: { fecha: formattedDate, estado: 1 } })
          .then((asueto) => {
            const isAsueto = !!asueto;
      
            // Consultar categorías
            return Categoria.findAll({ where: condition }).then((data) => {
              // Aplicar lógica para cobro_extra
              const shouldUseExtraCharge =
               isSaturdayAfter1PM || isAsueto;
      
              const modifiedData = data.map((categoria) => {
                const categoriaData = categoria.toJSON()
                if (shouldUseExtraCharge) {
                    const precioNormal = Number(categoriaData.precio) || 0; // Asegurar que sea numérico
                    const cobroExtra = Number(categoriaData.cobro_extra) || 0; // Asegurar que sea numérico
                    categoriaData.precio = precioNormal + cobroExtra; // Sumar valores
                  }
                return categoriaData;
              });
      
              res.send(modifiedData);
            });
          })
          .catch((error) => {
            console.error(error);
            res
              .status(400)
              .json({ msg: "Ha ocurrido un error, por favor intente más tarde" });
          });      
    },

    get(req, res) {
        Categoria.findAll({
            where: {
                estado: 1
            }
        })
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
    },
};

