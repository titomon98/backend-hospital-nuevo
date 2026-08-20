// CARPETA DE LABORATORIOS
const examenesAlmacenadosController = require('../controllers/laboratorio/examenesAlmacenadosController.js')
const campoExamenController = require('../controllers/laboratorio/campoExamenController.js')
const examenesRealizadosController = require('../controllers/laboratorio/examenesController')
const detalleExamenRealizado = require('../controllers/laboratorio/detalleExamenRealizadoController.js')

module.exports = (router) => {
    router.get('/laboratoriosAlmacenados/list', examenesAlmacenadosController.list);
    router.post('/laboratoriosAlmacenados/create', examenesAlmacenadosController.create);
    router.put('/laboratoriosAlmacenados/update', examenesAlmacenadosController.update);
    router.put('/campoLaboratorio/update', campoExamenController.update);
    router.post('/campoLaboratorio/create', campoExamenController.create);
    router.get('/campoLaboratorio/getByExamen', campoExamenController.getByExamen);
    router.get('/campoLaboratorio/getByExamenId', campoExamenController.getByExamenesId);

    //examenes realizados
    router.get('/Examenes_realizados/list', examenesRealizadosController.list);
    router.get('/Examenes_realizados/list2', examenesRealizadosController.list2);
    router.get('/Examenes_realizados/list3', examenesRealizadosController.list3);
    router.get('/Examenes_realizados/listId/:id', examenesRealizadosController.listCui);
    router.post('/Examenes_realizados/create', examenesRealizadosController.create);
    router.get('/encargadoExamen/getSearch', examenesRealizadosController.getsearchEncargado);
    router.get('/examenesAlmacenados/getSearch', examenesRealizadosController.getsearchExaAlmacenados);
    router.get('/examenesAlmacenadosBuscar/getSearch', examenesRealizadosController.getsearchExaAlmacenadosBuscar);
    router.put('/Examenes_realizados/update', examenesRealizadosController.update);
    router.delete('/examenes/eliminarExamen', examenesRealizadosController.eliminarExamen);

    //Detalle Examen Realizado
    router.get('/detalleExamenRealizado/list', detalleExamenRealizado.list);
    router.post('/detalleExamenRealizado/create', detalleExamenRealizado.create);
    router.get('/TipoExamenAlmacenado/getSearch', detalleExamenRealizado.getsearchTipo);
    router.get('/detalleExamenRealizado/get', detalleExamenRealizado.get);
}
