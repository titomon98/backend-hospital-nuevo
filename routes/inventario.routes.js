// CARPETA DE INVENTARIO
const alimentacionController = require('../controllers/inventario/alimentacionController')
const equiposController = require('../controllers/inventario/equiposController')
const mantenimientosController = require('../controllers/inventario/mantenimientosController')
const userController = require('../controllers/empleados/usuarioController')

module.exports = (router) => {
    //alimentacion
    router.get('/alimentos/list', alimentacionController.list);
    router.post('/alimentos/create', alimentacionController.create);
    router.put('/alimentos/update', alimentacionController.update);
    router.put('/alimentos/activate', alimentacionController.activate);
    router.put('/alimentos/deactivate', alimentacionController.deactivate);
    router.get('/alimentos/getSearch', alimentacionController.getSearch);

    //alimentacion_movimientos
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //equipos
    router.get('/equipos/list', equiposController.list);
    router.post('/equipos/create', equiposController.create);
    router.put('/equipos/update', equiposController.update);
    router.put('/equipos/activate', equiposController.activate);
    router.put('/equipos/deactivate', equiposController.deactivate);
    router.get('/equipos/getSearch', equiposController.getSearch);

    //equipos_movimientos
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //mantenimientos
    router.get('/mantenimientos/list', mantenimientosController.list);
    router.post('/mantenimientos/create', mantenimientosController.create);
    router.put('/mantenimientos/update', mantenimientosController.update);
    router.put('/mantenimientos/activate', mantenimientosController.activate);
    router.put('/mantenimientos/deactivate', mantenimientosController.deactivate);
    router.get('/mantenimientos/getSearch', mantenimientosController.getSearch);
}
