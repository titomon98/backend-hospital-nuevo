// CARPETA DE REPORTES (+ traslados)
const reportesCajaHospiController = require('../controllers/reportes/reportesCajaHospiController')
const reportesFarmaciaController = require('../controllers/reportes/reportesFarmaciaController.js')
const reportesPedidosController = require('../controllers/reportes/reportesPedidosController.js')
const reportesEnfermeriaController = require('../controllers/reportes/reportesEnfermeriaController')
const reportesExamenesController = require('../controllers/reportes/reportesExamenesController')
const reportesMedicosController = require('../controllers/reportes/reportesMedicosController')
const reportesPacientesController = require('../controllers/reportes/reportesPacientesController')
const reportesGerenciaController = require('../controllers/reportes/reportesGerenciaController')
const voucherHonorariosController = require('../controllers/medicos/voucher_honorariosController.js')
const trasladosController = require('../controllers/caja/trasladosController.js')

module.exports = (router) => {
    //reportes de caja de hospital
    router.get('/reporte/ingresosFechas', reportesCajaHospiController.ingresosFechas)
    router.get('/reporte/ingresosDia', reportesCajaHospiController.ingresosDia)
    router.get('/reporte/detalleMediosDePago', reportesCajaHospiController.detalleMediosDePagoMesActual)
    router.get('/reporte/simpleMediosDePago', reportesCajaHospiController.simpleMediosDePago)
    router.get('/reporte/mediosPagoPaciente', reportesCajaHospiController.mediosPagoPorPaciente)

    //reportes de farmacia
    router.get('/reporte/farmacia/productosMasUtilizados', reportesFarmaciaController.getProductosMasUtilizados)
    router.get('/reporte/farmacia/proveedores', reportesFarmaciaController.getProveedoresMasSolicitados)
    router.get('/reporte/farmacia/inventarioMedicina', reportesFarmaciaController.getInventarioMedicinas)
    router.get('/reporte/farmacia/iventarioGeneral', reportesFarmaciaController.getInventarioGeneral)
    router.get('/reporte/farmacia/suministroMedicamentos', reportesFarmaciaController.getMedicametosSuministrados)
    router.get('/reporte/pedidos/surtidos', reportesPedidosController.getSurtidos)

    //reportes de enfermeria
    router.get('/reporte/enfermeria/pacientesLugar', reportesEnfermeriaController.getPacientesPorLugar)
    router.get('/reporte/enfermeria/pacientesActuales', reportesEnfermeriaController.getPacientesActuales)
    router.get('/reporte/enfermeria/pacientesTodos', reportesEnfermeriaController.getTodosPacientesPorFechas)
    router.get('/reporte/enfermeria/serviciosMasConsumidos', reportesEnfermeriaController.getServiciosMasConsumidos)
    router.get('/reporte/enfermeria/medicamentos', reportesEnfermeriaController.getMedicamentosMasConsumidos)
    router.get('/reporte/enfermeria/fallecidos', reportesEnfermeriaController.getPacientesFallecidos)
    router.get('/reporte/enfermeria/egresados', reportesEnfermeriaController.getPacientesEgresados)

    //reportes de Medicos
    router.get('/reporte/medicos/honorarios', reportesMedicosController.reporteHonorarios)
    router.get('/reporte/medicos/medicoMasHonorarios', reportesMedicosController.reporteMedicoMasHonorarios)
    router.get('/reporte/medicos/optenerPacientes', voucherHonorariosController.getPacientesHonorarios)

    //reportes de Laboratorio
    router.get('/reporte/laboratio/examenesGeneral', reportesExamenesController.getReporteGeneralExamenes)
    router.get('/reporte/laboratio/MasMenosRealizados', reportesExamenesController.getReporteExamenesMasMenosRealizados)
    router.get('/reporte/laboratio/examenesDiarios', reportesExamenesController.getReporteExamenesDiarios)
    router.get('/reporte/laboratio/porMedico', reportesExamenesController.getReporteExamenesPorMedico)
    router.get('/reporte/laboratio/comisiones', reportesExamenesController.getAllExamenesPorMedico)

    //reportes de Gerencia
    router.get('/reporte/gerencia/censo', reportesGerenciaController.censoDiario)
    router.get('/reporte/gerencia/inventario', reportesGerenciaController.inventarioGeneral)
    router.get('/reporte/gerencia/cuentaDetallada', reportesGerenciaController.cuentaDetallada)
    router.get('/reporte/gerencia/cuentasPorCobrar', reportesGerenciaController.cuentasPorCobrar)
    router.get('/reporte/gerencia/cirugias', reportesGerenciaController.cirugiasRealizadas)
    router.get('/reporte/gerencia/estadisticaPacientes', reportesPacientesController.estadisticaPacientes)

    //traslados
    router.put('/traslados/emergencia/hospital', trasladosController.trasladarEmergenciaAHospital)
}
