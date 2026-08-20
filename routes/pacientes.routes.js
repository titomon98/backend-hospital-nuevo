// CARPETA DE PACIENTES
const recetaController = require('../controllers/paciente/recetaController')
const evolucionController = require('../controllers/paciente/evolucionController')
const ordenController = require('../controllers/paciente/ordenController')
const notasController = require('../controllers/paciente/notasController')

module.exports = (router) => {
    //recetas
    router.get('/recetas/list', recetaController.list);
    router.post('/recetas/create', recetaController.create);
    router.put('/recetas/update', recetaController.update);
    router.put('/recetas/activate', recetaController.activate);
    router.put('/recetas/deactivate', recetaController.deactivate);
    router.get('/recetas/getSearch', recetaController.getSearch);
    router.get('/recetas/getId', recetaController.getId)

    //ordenes
    router.get('/ordenes/list', ordenController.list);
    router.post('/ordenes/create', ordenController.create);
    router.put('/ordenes/update', ordenController.update);
    router.put('/ordenes/activate', ordenController.activate);
    router.put('/ordenes/deactivate', ordenController.deactivate);
    router.get('/ordenes/getSearch', ordenController.getSearch);
    router.get('/ordenes/getId', ordenController.getId)

    //evoluciones
    router.get('/evoluciones/list', evolucionController.list);
    router.post('/evoluciones/create', evolucionController.create);
    router.put('/evoluciones/update', evolucionController.update);
    router.put('/evoluciones/activate', evolucionController.activate);
    router.put('/evoluciones/deactivate', evolucionController.deactivate);
    router.get('/evoluciones/getSearch', evolucionController.getSearch);
    router.get('/evoluciones/getId', evolucionController.getId)

    //notas
    router.get('/notas/list', notasController.list);
    router.post('/notas/create', notasController.create);
    router.put('/notas/update', notasController.update);
    router.put('/notas/activate', notasController.activate);
    router.put('/notas/deactivate', notasController.deactivate);
    router.get('/notas/getSearch', notasController.getSearch);
    router.get('/notas/getId', notasController.getId)
}
