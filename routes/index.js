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
//CARPETA DE EMPLEADOS
const detalle_permisosController = require('../controllers/empleados/detalle_permisosController');
const userController = require('../controllers/empleados/usuarioController');
const userTypeController = require('../controllers/empleados/tipoUsuarioController');

//CARPETA DE SERVICIOS
const clasificacionesController = require('../controllers/servicios/clasificacionesController')
const coloresController = require('../controllers/servicios/coloresController')
const marcasController = require('../controllers/servicios/marcasController')
const tallasController = require('../controllers/servicios/tallasController')
const tiendasController = require('../controllers/servicios/tiendasController')
const zapatosController = require('../controllers/servicios/zapatosController')

//RUTAS

module.exports = (app) => {

    //FAVOR DE DEJAR ORGANIZADO POR CARPETAS EN ORDEN ALFABETICO

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

    //CARPETA DE SERVICIOS
    //clasificaciones
    router.get('/clasificaciones/list', clasificacionesController.list);
    router.post('/clasificaciones/create', clasificacionesController.create);
    router.put('/clasificaciones/update', clasificacionesController.update);
    router.put('/clasificaciones/activate', clasificacionesController.activate);
    router.put('/clasificaciones/deactivate', clasificacionesController.deactivate);
    router.get('/clasificaciones/get', clasificacionesController.get);
    router.get('/clasificaciones/getSelect', clasificacionesController.getSearch);

    //colores
    router.get('/colores/list', coloresController.list);
    router.post('/colores/create', coloresController.create);
    router.put('/colores/update', coloresController.update);
    router.put('/colores/activate', coloresController.activate);
    router.put('/colores/deactivate', coloresController.deactivate);
    router.get('/colores/get', coloresController.get);
    router.get('/colores/getSelect', coloresController.getSearch);

    //marcas
    router.get('/marcas/list', marcasController.list);
    router.post('/marcas/create', marcasController.create);
    router.put('/marcas/update', marcasController.update);
    router.put('/marcas/activate', marcasController.activate);
    router.put('/marcas/deactivate', marcasController.deactivate);
    router.get('/marcas/get', marcasController.get);
    router.get('/marcas/getSelect', marcasController.getSearch);

    //tallas
    router.get('/tallas/list', tallasController.list);
    router.post('/tallas/create', tallasController.create);
    router.put('/tallas/update', tallasController.update);
    router.put('/tallas/activate', tallasController.activate);
    router.put('/tallas/deactivate', tallasController.deactivate);
    router.get('/tallas/get', tallasController.get);
    router.get('/tallas/getSelect', tallasController.getSearch);

    //tiendas
    router.get('/tiendas/list', tiendasController.list);
    router.post('/tiendas/create', tiendasController.create);
    router.put('/tiendas/update', tiendasController.update);
    router.put('/tiendas/activate', tiendasController.activate);
    router.put('/tiendas/deactivate', tiendasController.deactivate);
    router.get('/tiendas/get', tiendasController.get);
    router.get('/tiendas/getSelect', tiendasController.getSearch);

    //zapatos
    router.get('/zapatos/list', zapatosController.list);
    router.post('/zapatos/create', zapatosController.create);
    router.put('/zapatos/update', zapatosController.update);
    router.put('/zapatos/activate', zapatosController.activate);
    router.put('/zapatos/deactivate', zapatosController.deactivate);
    router.get('/zapatos/get', zapatosController.get);
    router.get('/zapatos/getSelect', zapatosController.getSearch);

    //AUTH
    router.post('/login', authController.login);
    router.post('/refresh', authController.refresh);
    router.post('/logout', authController.logout);
    router.post('/autenticar', auth, authController.autenticar);

    app.use('/', router);
};