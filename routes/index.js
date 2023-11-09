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
const contratosController = require('../controllers/caja/contratosController')

//CARPETA DE ENFERMERIA
const habitacionesController = require('../controllers/enfermeria/habitacionesController')

//CARPETA DE FARMACIA
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
    //contrato
    router.get('/contrato/list', contratosController.list);
    router.post('/contrato/create', contratosController.create);
    router.put('/contrato/update', contratosController.update);
    router.put('/contrato/activate', contratosController.activate);
    router.put('/contrato/deactivate', contratosController.deactivate);
    router.get('/contrato/getSearch', contratosController.getSearch);

    //CARPETA DE ENFERMERIA
    //habitaciones
    router.get('/habitaciones/list', habitacionesController.list);
    router.post('/habitaciones/create', habitacionesController.create);
    router.put('/habitaciones/update', habitacionesController.update);
    router.put('/habitaciones/activate', habitacionesController.activate);
    router.put('/habitaciones/deactivate', habitacionesController.deactivate);
    router.get('/habitaciones/getSearch', habitacionesController.getSearch);
    
    //CARPETA DE FARMACIA
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
    router.post('/comun/create', comunController.create);
    router.put('/comun/update', comunController.update);
    router.put('/comun/activate', comunController.activate);
    router.put('/comun/deactivate', comunController.deactivate);
    router.get('/comun/getSearch', comunController.getSearch);

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
    router.post('/medicamentos/create', medicamentosController.create);
    router.put('/medicamentos/update', medicamentosController.update);
    router.put('/medicamentos/activate', medicamentosController.activate);
    router.put('/medicamentos/deactivate', medicamentosController.deactivate);
    router.get('/medicamentos/getSearch', medicamentosController.getSearch);

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
    router.put('/paquetes/update', paquetesController.update);
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
    router.post('/quirurgico/create', quirurgicoController.create);
    router.put('/quirurgico/update', quirurgicoController.update);
    router.put('/quirurgico/activate', quirurgicoController.activate);
    router.put('/quirurgico/deactivate', quirurgicoController.deactivate);
    router.get('/quirurgico/getSearch', quirurgicoController.getSearch);

    //quirurgico_movimientos
    router.get('/quirurgico_movimientos/list', quirurgicoMovimientosController.list);
    router.post('/quirurgico_movimientos/create', quirurgicoMovimientosController.create);
    router.put('/quirurgico_movimientos/update', quirurgicoMovimientosController.update);
    router.put('/quirurgico_movimientos/activate', quirurgicoMovimientosController.activate);
    router.put('/quirurgico_movimientos/deactivate', quirurgicoMovimientosController.deactivate);
    router.get('/quirurgico_movimientos/getSearch', quirurgicoMovimientosController.getSearch);

    //CARPETA DE INVENTARIO
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
    router.post('/validatePassword', authController.validatePassword);

    app.use('/', router);
};