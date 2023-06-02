'use strict'
const Sequelize     = require('sequelize');
const db = require("../../../models");
const DetailRecords = db.detail_records;
const Paciente = db.pacientes;
const Usuario = db.usuarios;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form
    
        const datos = {         
            contenido_digestivo: form.contenido_digestivo,
            estado_digestivo: form.estado_digestivo,
            contenido_respiratorio: form.contenido_respiratorio,
            estado_respiratorio: form.estado_respiratorio,
            contenido_cardiovascular: form.contenido_cardiovascular,
            estado_cardiovascular: form.estado_cardiovascular,
            contenido_urinario: form.contenido_urinario,
            estado_urinario: form.estado_urinario,
            contenido_femenino: form.contenido_femenino,
            estado_femenino: form.estado_femenino,
            contenido_endocrino: form.contenido_endocrino,
            estado_endocrino: form.estado_endocrino,
            contenido_osteo: form.contenido_osteo,
            estado_osteo: form.estado_osteo,
            contenido_nervioso: form.contenido_nervioso,
            estado_nervioso: form.estado_nervioso,
            contenido_sensorial: form.contenido_sensorial,
            estado_sensorial: form.estado_sensorial,
            contenido_piel: form.contenido_piel,
            estado_piel: form.estado_piel,
            contenido_habitus: form.contenido_habitus,
            estado_habitus: form.estado_habitus,
            contenido_cabeza: form.contenido_cabeza,
            estado_cabeza: form.estado_cabeza,
            contenido_faringe: form.contenido_faringe,
            estado_faringe: form.estado_faringe,
            contenido_cuello: form.contenido_cuello,
            estado_cuello: form.estado_cuello,
            contenido_torax: form.contenido_torax,
            estado_torax: form.estado_torax,
            contenido_precordial: form.contenido_precordial,
            estado_precordial: form.estado_precordial,
            contenido_glandulas: form.contenido_glandulas,
            estado_glandulas: form.estado_glandulas,
            contenido_abdomen: form.contenido_abdomen,
            estado_abdomen: form.estado_abdomen,
            contenido_genitales: form.contenido_genitales,
            estado_genitales: form.estado_genitales,
            contenido_extremidades: form.estado_extremidades,
            estado_extremidades: form.estado_extremidades,
            contenido_columna: form.contenido_columna,
            estado_columna: form.estado_columna,
            contenido_neurologica: form.contenido_neurologica,
            estado_neurologica: form.estado_neurologica,
            id_paciente: form.id_paciente,
            id_usuario: form.id_usuario,
        };
        
        DetailRecords.create(datos)
        .then(receta => {
        res.send(receta);

        }).catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
                    
    },

    update (req, res) {
        let form = req.body.form
        DetailRecords.update(
            {
                contenido_digestivo: form.contenido_digestivo,
                estado_digestivo: form.estado_digestivo,
                contenido_respiratorio: form.contenido_respiratorio,
                estado_respiratorio: form.estado_respiratorio,
                contenido_cardiovascular: form.contenido_cardiovascular,
                estado_cardiovascular: form.estado_cardiovascular,
                contenido_urinario: form.contenido_urinario,
                estado_urinario: form.estado_urinario,
                contenido_femenino: form.contenido_femenino,
                estado_femenino: form.estado_femenino,
                contenido_endocrino: form.contenido_endocrino,
                estado_endocrino: form.estado_endocrino,
                contenido_osteo: form.contenido_osteo,
                estado_osteo: form.estado_osteo,
                contenido_nervioso: form.contenido_nervioso,
                estado_nervioso: form.estado_nervioso,
                contenido_sensorial: form.contenido_sensorial,
                estado_sensorial: form.estado_sensorial,
                contenido_piel: form.contenido_piel,
                estado_piel: form.estado_piel,
                contenido_habitus: form.contenido_habitus,
                estado_habitus: form.estado_habitus,
                contenido_cabeza: form.contenido_cabeza,
                estado_cabeza: form.estado_cabeza,
                contenido_faringe: form.contenido_faringe,
                estado_faringe: form.estado_faringe,
                contenido_cuello: form.contenido_cuello,
                estado_cuello: form.estado_cuello,
                contenido_torax: form.contenido_torax,
                estado_torax: form.estado_torax,
                contenido_precordial: form.contenido_precordial,
                estado_precordial: form.estado_precordial,
                contenido_glandulas: form.contenido_glandulas,
                estado_glandulas: form.estado_glandulas,
                contenido_abdomen: form.contenido_abdomen,
                estado_abdomen: form.estado_abdomen,
                contenido_genitales: form.contenido_genitales,
                estado_genitales: form.estado_genitales,
                contenido_extremidades: form.contenido_extremidades,
                estado_extremidades: form.estado_extremidades,
                contenido_columna: form.contenido_columna,
                estado_columna: form.estado_columna,
                contenido_neurologica: form.contenido_neurologica,
                estado_neurologica: form.estado_neurologica,
            },
            { where: { 
                id: 1
            }}
        )
        .then(receta => 
            
            res.status(200).send('El registro ha sido actualizado'))
        .catch(error => res.status(400).send(error))
    },

    activate (req, res) {
        let id = req.body.id
        DetailRecords.update(
            { estado: 1 },
            { where: { 
                id: id
            } }
        )
        .then(receta => res.status(200).send('El registro ha sido activado'))
        .catch(error => res.status(400).send(error))
    },

    deactivate (req, res) {
        let id = req.body.id
        DetailRecords.update(
            { estado: 0 },
            { where: { 
                id: id
            } }
        )
        .then(receta =>res.status(200).send('El registro ha sido desactivado'))
        .catch(error => res.status(400).send(error))
    },

    get (req, res) {
        const { id } = req.query;
        // Validación de backend
       
        DetailRecords.findAll({ 
            where: { 
                id_paciente: 1
            },
            include: [
                {
                    model: Paciente,
                    as: 'paciente',
                    require: true,
                },
                {
                    model: Usuario,
                    as: 'usuario',
                    require: true,
                }
            ]
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

