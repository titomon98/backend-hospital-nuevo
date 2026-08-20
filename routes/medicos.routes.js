// CARPETA DE MEDICOS
const especialidadesController = require('../controllers/medicos/especialidadesController')
const medicosController = require('../controllers/medicos/medicosController')
const sociosController = require('../controllers/medicos/sociosController')
const voucherHonorariosController = require('../controllers/medicos/voucher_honorariosController.js')
const personalController = require('../controllers/medicos/personalController')
const detallePersonalController = require('../controllers/medicos/detallePersonalController')

module.exports = (router) => {
    //especialidades
    router.get('/especialidades/list', especialidadesController.list);
    router.post('/especialidades/create', especialidadesController.create);
    router.put('/especialidades/update', especialidadesController.update);
    router.put('/especialidades/activate', especialidadesController.activate);
    router.put('/especialidades/deactivate', especialidadesController.deactivate);
    router.get('/especialidades/getSearch', especialidadesController.getSearch);

    //medicos
    router.get('/medicos/list', medicosController.list);
    router.post('/medicos/create', medicosController.create);
    router.put('/medicos/update', medicosController.update);
    router.put('/medicos/activate', medicosController.activate);
    router.put('/medicos/deactivate', medicosController.deactivate);
    router.get('/medicos/getSearch', medicosController.getSearch);

    //socios
    router.get('/socios/list', sociosController.list);
    router.post('/socios/create', sociosController.create);
    router.put('/socios/update', sociosController.update);
    router.put('/socios/activate', sociosController.activate);
    router.put('/socios/deactivate', sociosController.deactivate);
    router.get('/socios/getSearch', sociosController.getSearch);

    //voucherPagoHonorarios
    router.post('/voucher/create', voucherHonorariosController.create);
    router.get('/voucher/getSearch', voucherHonorariosController.getSearch);
    router.get('/voucher/getPacientesHonorarios', voucherHonorariosController.getPacientesHonorarios)

    //personal
    router.get('/personal/list', personalController.list);
    router.post('/personal/create', personalController.create);
    router.put('/personal/update', personalController.update);
    router.put('/personal/activate', personalController.activate);
    router.put('/personal/deactivate', personalController.deactivate);
    router.get('/personal/getSearch', personalController.getSearch);

    //detalle_personal
    router.get('/detalle_personal/get', detallePersonalController.get);
    router.get('/detalle_personal/getAll', detallePersonalController.getAll);
    router.post('/detalle_personal/createForServicio', detallePersonalController.createForServicio);
}
