const { Router } = require('express');
const multer = require('multer');
const router = Router();
const auth = require("../middleware/auth");
const storage = multer.diskStorage({
    destination:function(req,file,cb){
         cb(null,'documents')
    },
    filename:function(req,file,cb){
         cb(null,`${Date.now()}-${file.originalname}`)
    }
})
const upload = multer({storage:storage})
//Importar controladores
const authController = require('../controllers/authController');

//FAVOR DE DEJAR ORGANIZADO POR CARPETAS EN ORDEN ALFABETICO
//CARPETA DE CAJA

//CARPETA DE ENFERMERIA

//CARPETA DE FARMACIA
const casaMedicaController = require('../controllers/farmacia/casaMedicaController')
const casaMedicaMovimientosController = require('../controllers/farmacia/casaMedicaMovimientosController')
const comunController = require('../controllers/farmacia/comunController')
const comunMovimientosController = require('../controllers/farmacia/comunMovimientosController')
const marcaController = require('../controllers/farmacia/marcaController')
const medicamentosController = require('../controllers/farmacia/medicamentosController')
const medicamentosMovimientosController = require('../controllers/farmacia/medicamentosMovimientosController')
const muestrasController = require('../controllers/farmacia/muestrasController')
const muestrasMovimientosController = require('../controllers/farmacia/muestrasMovimientosController')
const presentacionController = require('../controllers/farmacia/presentacionController')
const proveedorController = require('../controllers/farmacia/proveedorController')
const quirurgicoController = require('../controllers/farmacia/quirurgicoController')
const quirurgicoMovimientosController = require('../controllers/farmacia/quirurgicoMovimientosController')

//CARPETA DE GERENCIA


//CARPETA DE INVENTARIO
const alimentacionController = require('../controllers/inventario/alimentacionController')
const alimentacionMovimientosController = require('../controllers/inventario/alimentacionMovimientosController')
const equiposController = require('../controllers/inventario/equiposController')
const equiposMovimientosController = require('../controllers/inventario/equiposMovimientosController')

//CARPETA DE LIQUIDACIONES


//CARPETA DE MEDICOS
const especialidadesController = require('../controllers/medicos/especialidadesController')
const medicosController = require('../controllers/medicos/medicosController')
const sociosController = require('../controllers/medicos/sociosController')

//CARPETA DE EMPLEADOS
const detalle_permisosController = require('../controllers/empleados/detalle_permisosController');
const userController = require('../controllers/empleados/usuarioController');
const userTypeController = require('../controllers/empleados/tipoUsuarioController');

//RUTAS

module.exports = (app) => {

    //FAVOR DE DEJAR ORGANIZADO POR CARPETAS EN ORDEN ALFABETICO

    //CARPETA DE CAJA

    //CARPETA DE ENFERMERIA
    
    //CARPETA DE FARMACIA
    //casa_medica
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //casa_medica_movimientos
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //comun
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //comun_movimientos
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //marca
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //marca_movimientos
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //medicamentos
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //medicamentos_movimientos
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //muestras
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //muestras_movimientos
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //presentacion
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //proveedor
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //quirurgico
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //quirurgico_movimientos
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //CARPETA DE INVENTARIO
    //alimentacion
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);
    
    //alimentacion_movimientos
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //equipos
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //equipos_movimientos
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //CARPETA DE LIQUIDACIONES

    //CARPETA DE MEDICOS
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

    //CARPETA DE EMPLEADOS
    //detalle_permisos

    //permisos

    // tipos de usuario
    router.get('/type/get', userTypeController.get);

    // usuarios
    router.get('/user/list', userController.list);
    router.post('/user/create', userController.create);
    router.put('/user/update', userController.update);
    router.put('/user/activate', userController.activate);
    router.put('/user/deactivate', userController.deactivate);
    router.get('/user/getSearch', userController.getSearch);

    //AUTH
    router.post('/login', authController.login);
    router.post('/refresh', authController.refresh);
    router.post('/logout', authController.logout);
    router.post('/autenticar', auth, authController.autenticar);

    app.use('/', router);
};