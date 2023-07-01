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

//CARPETA DE INVENTARIO

//CARPETA DE LIQUIDACIONES

//CARPETA DE MEDICOS

//CARPETA DE EMPLEADOS
const detalle_permisosController = require('../controllers/empleados/detalle_permisosController');
const userController = require('../controllers/empleados/usuarioController');
const userTypeController = require('../controllers/empleados/tipoUsuarioController');

//CARPETA DE SERVICIOS


//RUTAS

module.exports = (app) => {

    //FAVOR DE DEJAR ORGANIZADO POR CARPETAS EN ORDEN ALFABETICO

    //CARPETA DE CAJA

    //CARPETA DE ENFERMERIA
    
    //CARPETA DE FARMACIA
    //casa_medica

    //casa_medica_movimientos

    //comun

    //comun_movimientos

    //marca

    //marca_movimientos

    //medicamentos

    //medicamentos_movimientos

    //muestras

    //muestras_movimientos

    //presentacion

    //proveedor

    //quirurgico

    //quirurgico_movimientos

    //CARPETA DE INVENTARIO
    //alimentacion
    
    //alimentacion_movimientos

    //equipos

    //equipos_movimientos

    //CARPETA DE LIQUIDACIONES

    //CARPETA DE MEDICOS
    //especialidades

    //medicos

    //socios

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