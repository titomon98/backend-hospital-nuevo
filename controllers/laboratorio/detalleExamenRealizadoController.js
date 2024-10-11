'use strict'
const Sequelize     = require('sequelize');
const db = require("../../models");
const Examenes = db.detalle_examen_realizado;
const CampoExamen = db.campo_examenes;
const TipoExamen = db.examenes_almacenados;
const UpdateExamenRealizado = db.examenes_realizados;
const Op = db.Sequelize.Op;
const moment = require('moment');

module.exports = {

    async create(req, res) {
            // Función para restar horas a la fecha
    const restarHoras = (fecha, horas) => {
        let nuevaFecha = new Date(fecha);
        nuevaFecha.setHours(nuevaFecha.getHours() - horas);
        return nuevaFecha;
    };

    // Obtener los resultados del request
    const resultados = req.body.resultados;
    console.log(resultados);
    if (!resultados || !resultados.length) {
        return res.status(400).json({ msg: 'No se recibieron resultados para guardar.' });
    }

    try {
        const idExamenRealizado = resultados[0].id;

        // Verificar si el examen a actualizar existe
        const examenSeleccionado = await UpdateExamenRealizado.findOne({
            where: { id: idExamenRealizado }
        });
        if (!examenSeleccionado) {
            return res.status(400).json({ msg: 'No se encontró el examen a actualizar' });
        }

        // Procesar cada resultado
        const promises = resultados.map(async (form) => {
            // Obtener los valores mínimo y máximo del campo de examen correspondiente a cada `id_campo`
            const campoExamen = await CampoExamen.findOne({
                where: { id: form.id_campo },
                attributes: ['valor_minimo', 'valor_maximo', 'nombre']  // Atributos que necesitamos
            });

            if (!campoExamen) {
                throw new Error(`No se encontró el campo de examen con id: ${form.id_campo}`);
            }

            // Comparar el resultado con los valores mínimo y máximo
            const { valor_minimo, valor_maximo, nombre } = campoExamen;
            let alarma = null;  // Inicializamos la variable de alarma como null

            if (parseFloat(form.resultado) < parseFloat(valor_minimo)) {
                alarma = 'SI';
            } else if (parseFloat(form.resultado) > parseFloat(valor_maximo)) {
                alarma = 'SI';
            }

            // Preparar los datos a insertar
            const datos = {
                id_examen_realizado: form.id,
                id_campo: form.id_campo,
                id_tipo: form.id_tipo,
                resultado: form.resultado,
                alarma: alarma,  // Guardamos la alarma si existe
                createdAt: restarHoras(new Date(), 6),
                updatedAt: restarHoras(new Date(), 6)
            };

            // Guardar el detalle del examen realizado
            return Examenes.create(datos);
        });

        // Esperar a que todas las promesas se resuelvan
        await Promise.all(promises);

        // Actualizar el estado del examen
        await examenSeleccionado.update({ estado: 2 });

        // Cambiar el estado del examen a 3
        await UpdateExamenRealizado.update(
            { estado: 3 },
            { where: { id: idExamenRealizado } }
        );

        res.status(200).json({ msg: 'Los resultados se han guardado y el examen ha sido actualizado.' });

    } catch (error) {
        console.error('Error al guardar los resultados o actualizar el examen:', error);
        return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde.' });
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
        const limit = size ? +size : 10;  // Aumentar el límite predeterminado a 10
        const offset = page ? page * limit : 0;
        return { limit, offset };
    };

    // Extraer valores de query params
    const { page = 1, size = 5, criterio = 'createdAt', order = 'DESC' } = req.query;
    const { limit, offset } = getPagination(page - 1, size);  // Ajustar la paginación correctamente

    try {
        // Buscar los resultados paginados del examen
        const data = await Examenes.findAndCountAll({
            attributes: ['resultado', 'alarma', 'id_campo', 'id_tipo', 'createdAt'],  // Incluir 'id_campo' y 'id_tipo'
            where: { id_examen_realizado: req.query.id },
            order: [[criterio, order]],  // Usar los parámetros de orden correctamente
            limit,
            offset,
        });

        const response = getPagingData(data, page - 1, limit);

        // Formatear los datos de la respuesta
        const dataResponse = await Promise.all(
            response.referido.map(async item => {
                // Obtener el nombre y valores del campo examen (sin asociación)
                const campoExamen = await CampoExamen.findOne({
                    where: { id: item.id_campo },
                    attributes: ['nombre', 'valor_minimo', 'valor_maximo']
                });

                const tipoExamen = await TipoExamen.findOne({
                    where: { id: item.id_tipo },
                    attributes: ['nombre']
                });

                return {
                    campo: campoExamen ? campoExamen.nombre : 'Campo no encontrado',  // Nombre del campo
                    tipo_examen: tipoExamen ? tipoExamen.nombre : 'Tipo no encontrado', // Nombre del tipo de examen
                    resultado: item.resultado,                  // Resultado del examen
                    valor_minimo: campoExamen ? campoExamen.valor_minimo : null, // Valor mínimo del campo
                    valor_maximo: campoExamen ? campoExamen.valor_maximo : null, // Valor máximo del campo
                    alarma: item.alarma,                        // Si hubo una alarma
                    fecha_hora: item.createdAt,                 // Fecha y hora del resultado
                };
            })
        );

        response.referido = dataResponse;

        // Enviar respuesta
        res.send({
            total: response.totalItems,
            total_pages: response.totalPages,
            current_page: page,
            from: offset + 1,
            to: offset + data.rows.length,
            data: response.referido
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
    }
    },
    
    async getsearchTipo(req, res) {
        const busqueda = req.query.search;
        const condition = busqueda ? { 
          nombre: { [Op.like]: `%${busqueda}%` } 
        } : null;
      
        try {
          const data = await CampoExamen.findAll({ where: condition });
          res.send(data);
        } catch (error) {
          console.error(error);
          res.status(500).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    },
    async get(req, res) {
        const id = req.query.id;
    
        // Verificar si el parámetro 'id' está definido
        if (!id) {
            return res.status(400).json({ msg: 'ID no proporcionado o inválido' });
        }
    
        try {
            // Consultar la tabla 'Examenes' (detalle_examen_realizado)
            const examenes = await Examenes.findAll({
                where: { id_examen_realizado: id },  // Filtrar por el ID del examen realizado
            });
    
            if (!examenes.length) {
                return res.status(402).json({ msg: 'No se encontraron resultados para el ID proporcionado.' });
            }
    
            // Para cada examen, hacer las consultas a las tablas 'CampoExamen' y 'TipoExamen'
            const detailedData = await Promise.all(examenes.map(async (examen) => {
                // Consultar la tabla 'CampoExamen' para obtener los datos del campo
                const campoExamen = await CampoExamen.findOne({
                    where: { id: examen.id_campo },  // Ajustar según la columna que relacione con id_campo
                    attributes: ['nombre', 'valor_minimo', 'valor_maximo']  // Campos que necesitas
                });
    
                // Consultar la tabla 'TipoExamen' para obtener el nombre del tipo de examen
                const tipoExamen = await TipoExamen.findOne({
                    where: { id: examen.id_tipo },  // Ajustar según la columna que relacione con id_tipo
                    attributes: ['nombre']  // Solo el nombre del tipo de examen
                });
    
                // Devolver el formato de los datos necesarios
                return {
                    campo: campoExamen ? campoExamen.nombre : 'Campo no encontrado',
                    tipo_examen: tipoExamen ? tipoExamen.nombre : 'Tipo no encontrado',
                    resultado: examen.resultado,
                    valor_minimo: campoExamen ? campoExamen.valor_minimo : null,
                    valor_maximo: campoExamen ? campoExamen.valor_maximo : null,
                    alarma: examen.alarma,
                    fecha_hora: examen.createdAt
                };
            }));
    
            // Enviar los datos formateados al frontend
            res.send(detailedData);
    
        } catch (error) {
            console.error('Error al obtener los detalles del examen:', error);
            return res.status(403).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        }
    }    
}