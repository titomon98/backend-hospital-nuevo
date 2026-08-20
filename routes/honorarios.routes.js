// CARPETA DE HONORARIOS
const detalleHonorariosController = require('../controllers/honorarios/detalleHonorariosController')

module.exports = (router) => {
    // Rutas para detalle_honorarios
    router.post('/detalle_honorarios/created', detalleHonorariosController.create);
    router.get('/detalle_honorarios', detalleHonorariosController.list);
    router.get('/detalle_honorarios/getId/:id', detalleHonorariosController.find);
    router.get('/detalle_honorarios/getSearch', detalleHonorariosController.getSearch);
    router.get('/detalle_honorarios/list', detalleHonorariosController.list);
    router.put('/detalle_honorarios/deactivate', detalleHonorariosController.deactivate)
    router.patch('/detalle_honorarios/updateTotal', detalleHonorariosController.updateTotal)
}
