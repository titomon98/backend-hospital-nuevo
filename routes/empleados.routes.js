// CARPETA DE EMPLEADOS (encargados, tipos, cuentas de laboratorio, usuarios)
const encargadosController = require('../controllers/laboratorio/encargadosController')
const tipoEncargadoController = require('../controllers/laboratorio/tipoEncargadoController.js')
const tipoExamenController = require('../controllers/laboratorio/tipoExamenController')
const labCuentasController = require('../controllers/laboratorio/labCuentasController')
const labDetalleCuentasController = require('../controllers/laboratorio/labDetalleCuentasController')
const labPagoSegurosController = require('../controllers/caja/labPagoSegurosController.js')
const userTypeController = require('../controllers/empleados/tipoUsuarioController')
const userController = require('../controllers/empleados/usuarioController')

module.exports = (router) => {
    //encargados
    router.get('/encargados/list', encargadosController.list);
    router.post('/encargados/create', encargadosController.create);
    router.put('/encargados/update', encargadosController.update);
    router.put('/encargados/activate', encargadosController.activate);
    router.put('/encargados/deactivate', encargadosController.deactivate);
    router.get('/encargados/getSearch', encargadosController.getSearch);
    router.get('/encargados/get', encargadosController.get);

    //tipos de encargados
    router.get('/tipos_encargados/get', tipoEncargadoController.get);

    //tipos de examenes
    router.get('/tipos_examenes/list', tipoExamenController.list);
    router.post('/tipos_examenes/create', tipoExamenController.create);
    router.put('/tipos_examenes/update', tipoExamenController.update);
    router.put('/tipos_examenes/activate', tipoExamenController.activate);
    router.put('/tipos_examenes/deactivate', tipoExamenController.deactivate);
    router.get('/tipos_examenes/getSearch', tipoExamenController.getSearch);
    router.get('/tipos_examenes/get', tipoExamenController.get);

    // CARPETA DE CUENTAS DE LABORATORIO
    //cuentas
    router.get('/lab_cuentas/list', labCuentasController.list);
    router.get('/lab_cuentas/debtList', labCuentasController.listNoPay);
    router.get('/lab_cuentas/payList', labCuentasController.listPay);
    router.get('/lab_cuentas/get', labCuentasController.get);
    router.get('/lab_cuentas/getByExp', labCuentasController.getByExp);
    router.get('/lab_cuentas/pay', labCuentasController.onPay);
    router.post('/lab_cuentas/create', labCuentasController.create);
    router.put('/lab_cuentas/update', labCuentasController.update);
    router.put('/lab_cuentas/activate', labCuentasController.activate);
    router.put('/lab_cuentas/deactivate', labCuentasController.deactivate);
    router.get('/lab_cuentas/getSearch', labCuentasController.getSearch);
    router.post('/lab_cuentas/requestDiscount', labCuentasController.DiscountRequest);
    router.get('/lab_cuentas/listDiscount', labCuentasController.listNoPayDiscountRequest);

    //Seguros laboratorios
    router.get('/lab_seguros/debtList', labPagoSegurosController.listAssuranceNoPay);

    //detalle cuentas
    router.get('/detalle/getByAccount', labDetalleCuentasController.getByAccount);
    router.get('/detalle/listCortesPerDate', labDetalleCuentasController.listCortesPerDate);

    // tipos de usuario
    router.get('/type/get', userTypeController.get);

    // usuarios
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);
}
