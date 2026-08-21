// CARPETA DE CAJA
const contratosController = require('../controllers/caja/contratosController')
const consumosController = require('../controllers/caja/consumosController')
const revisionConsumosController = require('../controllers/caja/revisionConsumosController')
const cuentasController = require('../controllers/caja/cuentasController')
const expedientesController = require('../controllers/caja/expedientesController')
const aseguradorasController = require('../controllers/caja/aseguradorasController')
const segurosController = require('../controllers/caja/segurosController')
const rubrosController = require('../controllers/caja/rubrosController')
const cajaChicaController = require('../controllers/caja/cajaChicaController')
const facturaController = require('../controllers/caja/facturaController.js')

module.exports = (router) => {
    //contrato
    router.get('/contrato/list', contratosController.list);
    router.post('/contrato/create', contratosController.create);
    router.put('/contrato/update', contratosController.update);
    router.put('/contrato/activate', contratosController.activate);
    router.put('/contrato/deactivate', contratosController.deactivate);
    router.get('/contrato/getSearch', contratosController.getSearch);

    //revision de consumos
    router.post('/revisionConsumos/set', revisionConsumosController.set);
    router.post('/revisionConsumos/confirmarConsumo', revisionConsumosController.confirmarConsumo);
    router.get('/revisionConsumos/consumos/:id_cuenta', revisionConsumosController.getConsumosRevision);
    router.get('/revisionConsumos/get/:id_cuenta', revisionConsumosController.get);

    //consumos
    router.get('/consumos/list', consumosController.list);
    router.post('/consumos/create', consumosController.create);
    router.put('/consumos/update', consumosController.update);
    router.put('/consumos/activate', consumosController.activate);
    router.put('/consumos/deactivate', consumosController.deactivate);
    router.get('/consumos/getSearch', consumosController.getSearch);
    router.get('/consumos/getId', consumosController.getId);
    router.get('/consumos/getById/:id',consumosController.obtenerConsumosPorIdCuenta);
    router.get('/consumos/historial/:id',consumosController.historialCuenta);
    router.get('/consumos/sumario/:id',consumosController.getDataSumario);
    router.get('/consumos/hojaEmergencia/:id', consumosController.getHojaEmergencia);
    router.get('/consumos/cuentaParcial/:id', consumosController.getCuentaParcial);

    //cuentas
    router.get('/cuentas/list', cuentasController.list);
    router.get('/cuentas/payList', cuentasController.listPay);
    router.get('/cuentas/debtList', cuentasController.listNoPay);
    router.get('/cuentas/debtListParcial', cuentasController.listNoPayParcial);
    router.get('/cuentas/get', cuentasController.get);
    router.get('/cuentas/getByExp', cuentasController.getByExp);
    router.get('/cuentas/pay', cuentasController.onPay);
    router.post('/cuentas/create', cuentasController.create);
    router.put('/cuentas/update', cuentasController.update);
    router.put('/cuentas/updateMotivoIngreso', cuentasController.updateMotivoIngreso);
    router.put('/cuentas/updateMotivoEgreso', cuentasController.updateMotivoEgreso);
    router.put('/cuentas/activate', cuentasController.activate);
    router.put('/cuentas/deactivate', cuentasController.deactivate);
    router.get('/cuentas/getSearch', cuentasController.getSearch);
    router.get('/cuentas/getTotales/:area', cuentasController.getTotales);
    router.patch('/cuentas/:id/ingresoParcialPago', cuentasController.ingresoParcialPago)
    router.post('/cuentas/:id/pagarCuentaParcial', cuentasController.pagarCuentaParcial)

    router.post('/cuentas/requestDiscount', cuentasController.DiscountRequest);
    router.get('/cuentas/listDiscount', cuentasController.listNoPayDiscountRequest);
    router.get('/cuentas/listCortesPerDate', cuentasController.listCortesPerDate);
    router.get('/cuentas/getByAccount', cuentasController.getByAccount);

    //Facturas
    router.post('/facturas/create', facturaController.create);
    router.post('/facturas/update', facturaController.update);
    router.post('/facturas/deactivate', facturaController.deactivate);
    router.get('/facturas/getList', facturaController.getList);

    //Seguros
    router.post('/seguros/create', segurosController.create);
    router.get('/seguros/list', segurosController.list);
    router.get('/seguros/debtList', segurosController.assurancePayList);
    router.put('/seguros/deactivate', segurosController.deactivate);
    router.put('/seguros/paid', segurosController.paid);
    router.put('/seguros/debt', segurosController.debt);
    router.get('/seguros/getByExp', segurosController.getAssuranceByExp);

    //Rubros
    router.post('/rubros/create', rubrosController.create);
    router.get('/rubros/list', rubrosController.list);
    router.get('/rubros/get', rubrosController.get);
    router.put('/rubros/update', rubrosController.update);
    router.put('/rubros/activate', rubrosController.activate);
    router.put('/rubros/deactivate', rubrosController.deactivate);

    //CajaChica
    router.post('/cajaChica/create', cajaChicaController.create);
    router.get('/cajaChica/list', cajaChicaController.list);

    //Aseguradoras
    router.post('/aseguradoras/create', aseguradorasController.create);
    router.get('/aseguradoras/get', aseguradorasController.get);

    //expedientes
    router.get('/expedientes/list', expedientesController.list);
    router.get('/expedientes/listAsignar', expedientesController.listAsignar);
    router.get('/expedientes/listPanel', expedientesController.listPanel);
    router.post('/expedientes/create', expedientesController.create);
    router.post('/expedientes/createEmergencia', expedientesController.createEmergencia);
    router.post('/expedientes/createEnfermeria', expedientesController.createFromEnfermeria);
    router.put('/expedientes/update', expedientesController.update);
    router.put('/expedientes/changeState', expedientesController.changeState);
    router.put('/expedientes/assignDoctor', expedientesController.updateMedico);
    router.put('/expedientes/assignRoom', expedientesController.asignarHabitacion);
    router.put('/expedientes/activate', expedientesController.activate);
    router.put('/expedientes/deactivate', expedientesController.deactivate);
    router.get('/expedientes/getSearch', expedientesController.getSearch)
    router.get('/expedientes/getSearcExamenes', expedientesController.getSearchExamenes)
    router.get('/expedientes/getAll', expedientesController.get);
    router.get('/expedientes/listQuirofano', expedientesController.listQuirofano);
    router.get('/expedientes/listEmergencia', expedientesController.listEmergencia);
    router.get('/expedientes/listIntensivo', expedientesController.listIntensivo);
    router.get('/expedientes/listHospitalizacion', expedientesController.listHospitalizacion);
    router.get('/expedientes/listReingreso', expedientesController.listReingreso);
    router.put('/expedientes/changeStatus', expedientesController.changeStatus);
    router.delete('/expedientes/delete', expedientesController.delete)
    router.put('/expedientes/egresoNormal', expedientesController.egresoNormal);
    router.post('/expedientes/reingresoNormal', expedientesController.reingresoNormal);
    router.post('/expedientes/reingresoConAsignacion', expedientesController.reingresoConAsignacion);
    router.put('/expedientes/egresoEmergencia', expedientesController.egresoEmergencia)
    router.get('/expedientes/listEmergenciaHistorial', expedientesController.listEmergenciaHistorial);
    router.get('/expedientes/listPacientesHistorial', expedientesController.listPacientesHistorial);
    router.get('/expedientes/listPacientesActivos', expedientesController.listPacientesActivos);
    router.get('/expedientes/getCuentasExpediente/:id', expedientesController.getCuentasExpediente);
}
