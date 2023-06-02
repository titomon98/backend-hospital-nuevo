'use strict'
const Sequelize     = require('sequelize');
const db = require("../../../models");
const Paciente = db.pacientes;
const Consulta = db.consultas;
const ConsultaLab = db.consulta_laboratorios;
const Record = db.records;
const DetailRecords = db.detail_records;
const Op = db.Sequelize.Op;

module.exports = {
    create(req, res) {
        let form = req.body.form 
        let datosPaciente
        if (form.born !== ''){
            datosPaciente = {
                edad: form.age,
                nacimiento: form.born,
                id_doctor: form.doctor,
                id: form.id,
                nombre: form.name,
                procedencia: form.origin,
                referente: form.referrer,
                referido: form.referred,
                apellidos: form.secondName,
                telefono: form.phoneNumber,
                cui: form.cui,
                estado: 1,
                estado_express: 1,
                id_usuario: form.id_usuario
            };
        }
        else {
            datosPaciente = {
                edad: form.age,
                id_doctor: form.doctor,
                id: form.id,
                nombre: form.name,
                procedencia: form.origin,
                referente: form.referrer,
                referido: form.referred,
                apellidos: form.secondName,
                telefono: form.phoneNumber,
                cui: form.cui,
                estado: 1,
                estado_express: 1,
                id_usuario: form.id_usuario
            };
        }
        let title = form.name + ' ' + form.secondName + ' - Primera consulta '
        
        Paciente.create(datosPaciente)
        .then(paciente => {              
            const datosConsulta = {
                start: form.start,
                startDate: form.startDate,
                hora_entrada: form.startTime.startTime, //Revisar si el startTime esta bien
                referido: form.referred,
                id_paciente: paciente.id,
                id_medico: form.doctor[0].id,
                estado: 1,
                estado_consulta: 1,
                title: title
            }

            const motivosConsulta = {
                contenido: form.description,
                id_paciente: paciente.id,
                id_usuario: 1, //Aqui cambiarlo por el usuario actual
                estado: 1,
            }

            const datosRecord = {         
                contenido_digestivo: ' ',
                estado_digestivo: 1,
                contenido_respiratorio: ' ',
                estado_respiratorio: 1,
                contenido_cardiovascular: ' ',
                estado_cardiovascular: 1,
                contenido_urinario: ' ',
                estado_urinario: 1,
                contenido_femenino: ' ',
                estado_femenino: 1,
                contenido_endocrino: ' ',
                estado_endocrino: 1,
                contenido_osteo: ' ',
                estado_osteo: 1,
                contenido_nervioso: ' ',
                estado_nervioso: 1,
                contenido_sensorial: ' ',
                estado_sensorial: 1,
                contenido_piel: ' ',
                estado_piel: 1,
                contenido_habitus: ' ',
                estado_habitus: 1,
                contenido_cabeza: ' ',
                estado_cabeza: 1,
                contenido_faringe: ' ',
                estado_faringe: 1,
                contenido_cuello: ' ',
                estado_cuello: 1,
                contenido_torax: ' ',
                estado_torax: 1,
                contenido_precordial: ' ',
                estado_precordial: 1,
                contenido_glandulas: ' ',
                estado_glandulas: 1,
                contenido_abdomen: ' ',
                estado_abdomen: 1,
                contenido_genitales: ' ',
                estado_genitales: 1,
                contenido_extremidades: ' ',
                estado_extremidades: 1,
                contenido_columna: ' ',
                estado_columna: 1,
                contenido_neurologica: ' ',
                estado_neurologica: 1,
                id_paciente: paciente.id,
                id_usuario: 1, //Aqui cambiarlo por el usuario actual
            };

            Consulta.create(datosConsulta);
            Record.create(motivosConsulta)
            DetailRecords.create(datosRecord)
            Paciente.update({
                num_expediente: paciente.id,
            },
            { 
                where: { 
                id: paciente.id
            }}).then(paciente => {   
                console.log('todo bien')
            })
            .catch(error => {
                console.log(error)
                return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
            });
            res.send(paciente);

        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
                    
    },

    create_lab(req, res) {
        let form = req.body.form 
        let datosPaciente
        if (form.born !== ''){
            datosPaciente = {
                edad: form.age,
                nacimiento: form.born,
                id: form.id,
                nombre: form.name,
                procedencia: form.origin,
                referente: form.referrer,
                referido: form.referred,
                apellidos: form.secondName,
                telefono: form.phoneNumber,
                cui: form.cui,
                estado: 1,
                estado_express: 1,
                id_usuario: form.id_usuario
            };
        }
        else {
            datosPaciente = {
                edad: form.age,
                id_doctor: form.doctor,
                id: form.id,
                nombre: form.name,
                procedencia: form.origin,
                referente: form.referrer,
                referido: form.referred,
                apellidos: form.secondName,
                telefono: form.phoneNumber,
                cui: form.cui,
                estado: 1,
                estado_express: 1,
                id_usuario: form.id_usuario
            };
        }

        let title = form.name + ' ' + form.secondName + ' - ' + form.exam[0].nombre
        
        Paciente.create(datosPaciente)
        .then(paciente => {    
            console.log(form.exam[0].id)         
            const datosConsulta = {
                start: form.start,
                startDate: form.startDate,
                hora_entrada: form.startTime.startTime, //Revisar si el startTime esta bien
                referido: form.referred,
                id_paciente: paciente.id,
                id_examen: form.exam[0].id, //PEDRO AQUI CAMBIA POR EL ID DEL EXAMEN
                estado: 1,
                estado_consulta: 1,
                title: title
            }

            const motivosConsulta = {
                contenido: form.description,
                id_paciente: paciente.id,
                id_usuario: 1, //Aqui cambiarlo por el usuario actual
                estado: 1,
            }

            const datosRecord = {         
                contenido_digestivo: ' ',
                estado_digestivo: 1,
                contenido_respiratorio: ' ',
                estado_respiratorio: 1,
                contenido_cardiovascular: ' ',
                estado_cardiovascular: 1,
                contenido_urinario: ' ',
                estado_urinario: 1,
                contenido_femenino: ' ',
                estado_femenino: 1,
                contenido_endocrino: ' ',
                estado_endocrino: 1,
                contenido_osteo: ' ',
                estado_osteo: 1,
                contenido_nervioso: ' ',
                estado_nervioso: 1,
                contenido_sensorial: ' ',
                estado_sensorial: 1,
                contenido_piel: ' ',
                estado_piel: 1,
                contenido_habitus: ' ',
                estado_habitus: 1,
                contenido_cabeza: ' ',
                estado_cabeza: 1,
                contenido_faringe: ' ',
                estado_faringe: 1,
                contenido_cuello: ' ',
                estado_cuello: 1,
                contenido_torax: ' ',
                estado_torax: 1,
                contenido_precordial: ' ',
                estado_precordial: 1,
                contenido_glandulas: ' ',
                estado_glandulas: 1,
                contenido_abdomen: ' ',
                estado_abdomen: 1,
                contenido_genitales: ' ',
                estado_genitales: 1,
                contenido_extremidades: ' ',
                estado_extremidades: 1,
                contenido_columna: ' ',
                estado_columna: 1,
                contenido_neurologica: ' ',
                estado_neurologica: 1,
                id_paciente: paciente.id,
                id_usuario: 1, //Aqui cambiarlo por el usuario actual
            };

            ConsultaLab.create(datosConsulta); 
            Record.create(motivosConsulta)
            DetailRecords.create(datosRecord)
            Paciente.update({
                num_expediente: paciente.id,
            },
            { 
                where: { 
                id: paciente.id
            }}).then(paciente => {   
                console.log('todo bien')
            })
            .catch(error => {
                console.log(error)
                return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
            });
            res.send(paciente);

        })
        .catch(error => {
            console.log(error)
            return res.status(400).json({ msg: 'Ha ocurrido un error, por favor intente más tarde' });
        });
                    
    },
};
