// CARPETA DE FARMACIA
const alertasController = require('../controllers/farmacia/alertasController')
const casaMedicaController = require('../controllers/farmacia/casaMedicaController')
const comunController = require('../controllers/farmacia/comunController')
const comunMovimientosController = require('../controllers/farmacia/comunMovimientosController')
const ingresosController = require('../controllers/farmacia/ingresosController')
const marcaController = require('../controllers/farmacia/marcaController')
const medicamentosController = require('../controllers/farmacia/medicamentosController')
const medicamentosMovimientosController = require('../controllers/farmacia/medicamentosMovimientosController')
const muestrasController = require('../controllers/farmacia/muestrasController')
const muestrasMovimientosController = require('../controllers/farmacia/muestrasMovimientosController')
const paquetesController = require('../controllers/farmacia/paquetesController')
const presentacionController = require('../controllers/farmacia/presentacionController')
const proveedorController = require('../controllers/farmacia/proveedorController')
const quirurgicoController = require('../controllers/farmacia/quirurgicoController')
const quirurgicoMovimientosController = require('../controllers/farmacia/quirurgicoMovimientosController')
const detalle_consumo_medicamentos = require('../controllers/farmacia/consumoMedicamentosController.js')
const detalle_consumo_quirugicos = require('../controllers/farmacia/consumoQuirurgicosController.js')
const detalle_consumo_comunes = require('../controllers/farmacia/consumoComunController.js')

module.exports = (router) => {
    //alertas
    router.get('/alertas/listMedicamentos', alertasController.listMedicamentos);
    router.get('/alertas/listComunes', alertasController.listComunes);
    router.get('/alertas/listQuirurgico', alertasController.listQuirurgico);

    //casa_medica
    router.get('/casa_medica/list', casaMedicaController.list);
    router.post('/casa_medica/create', casaMedicaController.create);
    router.put('/casa_medica/update', casaMedicaController.update);
    router.put('/casa_medica/activate', casaMedicaController.activate);
    router.put('/casa_medica/deactivate', casaMedicaController.deactivate);
    router.get('/casa_medica/getSearch', casaMedicaController.getSearch);

    //comun
    router.get('/comun/list', comunController.list);
    router.get('/comun/list2', comunController.get);
    router.post('/comun/create', comunController.create);
    router.put('/comun/update', comunController.update);
    router.put('/comun/activate', comunController.activate);
    router.put('/comun/deactivate', comunController.deactivate);
    router.get('/comun/getSearch', comunController.getSearch);
    router.get('/comun/getSearchNo', comunController.getSearchNo);
    router.get('/comun/getOne', comunController.getOne);

    //comun_movimientos
    router.get('/comun_movimientos/list', comunMovimientosController.list);
    router.post('/comun_movimientos/create', comunMovimientosController.create);
    router.put('/comun_movimientos/update', comunMovimientosController.update);
    router.put('/comun_movimientos/activate', comunMovimientosController.activate);
    router.put('/comun_movimientos/deactivate', comunMovimientosController.deactivate);
    router.get('/comun_movimientos/getSearch', comunMovimientosController.getSearch);

    //ingresos
    router.get('/ingresos/list', ingresosController.list);
    router.post('/ingresos/create', ingresosController.create);
    router.put('/ingresos/update', ingresosController.update);
    router.put('/ingresos/activate', ingresosController.activate);
    router.put('/ingresos/deactivate', ingresosController.deactivate);
    router.get('/ingresos/getSearch', ingresosController.getSearch);
    router.put('/ingresos/confirm', ingresosController.confirm)

    //marca
    router.get('/marca/list', marcaController.list);
    router.post('/marca/create', marcaController.create);
    router.put('/marca/update', marcaController.update);
    router.put('/marca/activate', marcaController.activate);
    router.put('/marca/deactivate', marcaController.deactivate);
    router.get('/marca/getSearch', marcaController.getSearch);

    //medicamentos
    router.get('/medicamentos/list', medicamentosController.list);
    router.get('/medicamentos/list2', medicamentosController.get);
    router.get('/medicamentos/anestesicos', medicamentosController.getAnestesicos);
    router.post('/medicamentos/create', medicamentosController.create);
    router.put('/medicamentos/update', medicamentosController.update);
    router.put('/medicamentos/activate', medicamentosController.activate);
    router.put('/medicamentos/deactivate', medicamentosController.deactivate);
    router.get('/medicamentos/getSearch', medicamentosController.getSearch);
    router.get('/medicamentos/getSearchNo', medicamentosController.getSearchNo);
    router.get('/medicamentos/getOne', medicamentosController.getOne);

    //medicamentos_movimientos
    router.get('/medicamentos_movimientos/list', medicamentosMovimientosController.list);
    router.post('/medicamentos_movimientos/create', medicamentosMovimientosController.create);
    router.put('/medicamentos_movimientos/update', medicamentosMovimientosController.update);
    router.put('/medicamentos_movimientos/activate', medicamentosMovimientosController.activate);
    router.put('/medicamentos_movimientos/deactivate', medicamentosMovimientosController.deactivate);
    router.get('/medicamentos_movimientos/getSearch', medicamentosMovimientosController.getSearch);

    //muestras
    router.get('/muestras/list', muestrasController.list);
    router.post('/muestras/create', muestrasController.create);
    router.put('/muestras/update', muestrasController.update);
    router.put('/muestras/activate', muestrasController.activate);
    router.put('/muestras/deactivate', muestrasController.deactivate);
    router.get('/muestras/getSearch', muestrasController.getSearch);

    //muestras_movimientos
    router.get('/muestras_movimientos/list', muestrasMovimientosController.list);
    router.post('/muestras_movimientos/create', muestrasMovimientosController.create);
    router.put('/muestras_movimientos/update', muestrasMovimientosController.update);
    router.put('/muestras_movimientos/activate', muestrasMovimientosController.activate);
    router.put('/muestras_movimientos/deactivate', muestrasMovimientosController.deactivate);
    router.get('/muestras_movimientos/getSearch', muestrasMovimientosController.getSearch);

    //paquetes
    router.get('/paquetes/list', paquetesController.list);
    router.post('/paquetes/create', paquetesController.create);
    router.post('/paquetes/aplicarACuenta', paquetesController.aplicarACuenta);
    router.put('/paquetes/update', paquetesController.update);
    router.put('/paquetes/editar', paquetesController.editar);
    router.put('/paquetes/activate', paquetesController.activate);
    router.put('/paquetes/deactivate', paquetesController.deactivate);
    router.get('/paquetes/getSearch', paquetesController.getSearch);

    //presentacion
    router.get('/presentacion/list', presentacionController.list);
    router.post('/presentacion/create', presentacionController.create);
    router.put('/presentacion/update', presentacionController.update);
    router.put('/presentacion/activate', presentacionController.activate);
    router.put('/presentacion/deactivate', presentacionController.deactivate);
    router.get('/presentacion/getSearch', presentacionController.getSearch);

    //proveedor
    router.get('/proveedor/list', proveedorController.list);
    router.post('/proveedor/create', proveedorController.create);
    router.put('/proveedor/update', proveedorController.update);
    router.put('/proveedor/activate', proveedorController.activate);
    router.put('/proveedor/deactivate', proveedorController.deactivate);
    router.get('/proveedor/getSearch', proveedorController.getSearch);

    //quirurgico
    router.get('/quirurgico/list', quirurgicoController.list);
    router.get('/quirurgico/list2', quirurgicoController.get);
    router.post('/quirurgico/create', quirurgicoController.create);
    router.put('/quirurgico/update', quirurgicoController.update);
    router.put('/quirurgico/activate', quirurgicoController.activate);
    router.put('/quirurgico/deactivate', quirurgicoController.deactivate);
    router.get('/quirurgico/getSearch', quirurgicoController.getSearch);
    router.get('/quirurgico/getSearchNo', quirurgicoController.getSearchNo);
    router.get('/quirurgico/getOne', quirurgicoController.getOne);

    //quirurgico_movimientos
    router.get('/quirurgico_movimientos/list', quirurgicoMovimientosController.list);
    router.post('/quirurgico_movimientos/create', quirurgicoMovimientosController.create);
    router.put('/quirurgico_movimientos/update', quirurgicoMovimientosController.update);
    router.put('/quirurgico_movimientos/activate', quirurgicoMovimientosController.activate);
    router.put('/quirurgico_movimientos/deactivate', quirurgicoMovimientosController.deactivate);
    router.get('/quirurgico_movimientos/getSearch', quirurgicoMovimientosController.getSearch);

    //detalle_consumo_medicamentos
    router.post('/detalle_consumo_medicamentos/create', detalle_consumo_medicamentos.create);
    router.get('/detalle_consumo_medicamentos/list/:id/:area', detalle_consumo_medicamentos.get);
    router.get('/detalle_consumo_medicamentos/listAnestesicos/:id/:area', detalle_consumo_medicamentos.getAnestesico);
    router.get('/detalle_consumo_medicamentos/list', detalle_consumo_medicamentos.list);
    router.get('/detalle_consumo_medicamentos/listAnestesicos', detalle_consumo_medicamentos.listAnestesicos);
    router.put('/detalle_consumo_medicamentos/deactivate', detalle_consumo_medicamentos.deactivate)
    router.put('/detalle_consumo_medicamentos/review', detalle_consumo_medicamentos.review)

    //detalle_consumo_quirurgicos
    router.post('/detalle_consumo_quirugicos/create', detalle_consumo_quirugicos.create);
    router.get('/detalle_consumo_quirugicos/list/:id/:area', detalle_consumo_quirugicos.get);
    router.get('/detalle_consumo_quirugicos/list', detalle_consumo_quirugicos.list);
    router.put('/detalle_consumo_quirurgicos/deactivate', detalle_consumo_quirugicos.deactivate)
    router.put('/detalle_consumo_quirurgicos/review', detalle_consumo_quirugicos.review)

    //detalle_consumo_comunes
    router.post('/detalle_consumo_comun/create', detalle_consumo_comunes.create);
    router.get('/detalle_consumo_comun/list/:id/:area', detalle_consumo_comunes.get);
    router.get('/detalle_consumo_comun/list', detalle_consumo_comunes.list);
    router.put('/detalle_consumo_comun/deactivate', detalle_consumo_comunes.deactivate)
    router.put('/detalle_consumo_comun/review', detalle_consumo_comunes.review)
}
