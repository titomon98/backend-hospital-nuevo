const { Router } = require('express');
const router = Router();
const auth = require("../middleware/auth");
const authController = require('../controllers/authController');

// Las rutas estan divididas por carpeta/dominio en archivos aparte.
// Cada modulo exporta (router) => { ...sus rutas... } y aqui se montan.
const cajaRoutes = require('./caja.routes');
const enfermeriaRoutes = require('./enfermeria.routes');
const farmaciaRoutes = require('./farmacia.routes');
const gerenciaRoutes = require('./gerencia.routes');
const honorariosRoutes = require('./honorarios.routes');
const inventarioRoutes = require('./inventario.routes');
const laboratorioRoutes = require('./laboratorio.routes');
const medicosRoutes = require('./medicos.routes');
const pacientesRoutes = require('./pacientes.routes');
const empleadosRoutes = require('./empleados.routes');
const reportesRoutes = require('./reportes.routes');

module.exports = (app) => {

    //AUTH — rutas publicas. Van ANTES del router.use(auth) de abajo, porque
    //no se puede exigir un token a quien todavia no lo tiene.
    router.post('/login', authController.login);
    router.post('/refresh', authController.refresh);
    router.post('/logout', authController.logout);
    router.post('/validatePassword', authController.validatePassword);

    //A partir de aqui todo exige token. Una sola linea en vez de repetir
    //el middleware en cada ruta: lo que no este arriba, queda protegido.
    router.use(auth);

    router.post('/autenticar', authController.autenticar);

    //Modulos por carpeta (todas estas rutas quedan protegidas por el auth de arriba).
    cajaRoutes(router);
    enfermeriaRoutes(router);
    farmaciaRoutes(router);
    gerenciaRoutes(router);
    honorariosRoutes(router);
    inventarioRoutes(router);
    laboratorioRoutes(router);
    medicosRoutes(router);
    pacientesRoutes(router);
    empleadosRoutes(router);
    reportesRoutes(router);

    app.use('/', router);
};
