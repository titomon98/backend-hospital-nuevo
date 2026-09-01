// CARPETA DE ENFERMERIA
const habitacionesController = require('../controllers/enfermeria/habitacionesController')
const detalleHabitacionesController = require('../controllers/enfermeria/detalleHabitacionesController')
const pedidosController = require('../controllers/enfermeria/pedidosController')
const detallePedidosController = require('../controllers/enfermeria/detallePedidosController')
const servicioSalaOperacionesController = require('../controllers/enfermeria/servicioSalaOperacionesController')
const CategoriaSalaOperacionesController = require('../controllers/enfermeria/categoriaSalaOperacionesController')
const serviciosController = require('../controllers/enfermeria/serviciosController')

module.exports = (router) => {
    //habitaciones
    router.get('/habitaciones/list', habitacionesController.list);
    router.post('/habitaciones/create', habitacionesController.create);
    router.put('/habitaciones/update', habitacionesController.update);
    router.put('/habitaciones/activate', habitacionesController.activate);
    router.put('/habitaciones/deactivate', habitacionesController.deactivate);
    router.put('/habitaciones/inUse', habitacionesController.inUse);
    router.put('/habitaciones/available', habitacionesController.available);
    router.get('/habitaciones/getSearch', habitacionesController.getSearch);
    router.get('/habitaciones/get', habitacionesController.get);
    router.get('/habitaciones/getAll', habitacionesController.getAll);

    router.get('/detalle_cobros_habitacion/list', detalleHabitacionesController.list);
    router.put('/detalle_cobros_habitacion/deactivate', detalleHabitacionesController.deactivate)

    //servicios
    router.get('/servicios/list', serviciosController.list);
    router.post('/servicios/create', serviciosController.create);
    router.put('/servicios/update', serviciosController.update);
    router.put('/servicios/activate', serviciosController.activate);
    router.put('/servicios/deactivate', serviciosController.deactivate);
    router.get('/servicios/getSearch', serviciosController.getSearch);
    router.get('/servicios/getSearch', serviciosController.getSearch);
    router.get('/servicios/list', serviciosController.list);
    router.post('/servicios/create', serviciosController.create);
    router.put('/servicios/update', serviciosController.update);
    router.put('/servicios/activate', serviciosController.activate);
    router.put('/servicios/deactivate', serviciosController.deactivate);
    router.get('/servicios/get', serviciosController.get);

    //categoria sala opereciones
    router.post('/Categorias_Sala_Operaciones/create', CategoriaSalaOperacionesController.create);
    router.get('/Categorias_Sala_Operaciones/list', CategoriaSalaOperacionesController.list);
    router.put('/Categorias_Sala_Operaciones/update', CategoriaSalaOperacionesController.update);
    router.put('/Categorias_Sala_Operaciones/activate', CategoriaSalaOperacionesController.activate);
    router.put('/Categorias_Sala_Operaciones/deactivate', CategoriaSalaOperacionesController.deactivate);
    router.get('/Categorias_Sala_Operaciones/get', CategoriaSalaOperacionesController.get);
    router.get('/Categorias_Sala_Operaciones/get/:id', CategoriaSalaOperacionesController.getId);
    router.get('/Categorias_Sala_Operaciones/getSearch', CategoriaSalaOperacionesController.getSearch);

    //pedidos
    router.get('/pedidos/list', pedidosController.list);
    router.get('/pedidos/getPerYear', pedidosController.getPerYear);
    router.post('/pedidos/create', pedidosController.create);
    router.put('/pedidos/update', pedidosController.update);
    router.put('/pedidos/activate', pedidosController.activate);
    router.put('/pedidos/deactivate', pedidosController.deactivate);
    router.get('/pedidos/getSearch', pedidosController.getSearch);

    //pedidos
    router.get('/detalle_pedidos/list', detallePedidosController.list);
    router.get('/detalle_pedidos/getByAccount', detallePedidosController.getByAccountId);
    router.get('/detalle_pedidos/getPendientes', detallePedidosController.getPendientes);
    router.post('/detallePedidos/surtir', detallePedidosController.surtir);

    //servicioSalaOperaciones
    router.post('/salaOperaciones/created', servicioSalaOperacionesController.create);
    router.get('/salaOperaciones/list', servicioSalaOperacionesController.list);
    router.get('/salaOperaciones/getId/:id', servicioSalaOperacionesController.find);
    router.get('/salaOperaciones/getSearch', servicioSalaOperacionesController.getSearch);
    router.put('/salaOperaciones/editarTotal', servicioSalaOperacionesController.editarTotal);
    router.get('/salaOperaciones/listAjustes', servicioSalaOperacionesController.listAjustes);
}
