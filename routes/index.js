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
//CARPETA DE ADMINISTRATIVO
const gastosController = require('../controllers/administrativo/gastosController')
const ingresosController = require('../controllers/administrativo/ingresosController')
const planillaController = require('../controllers/administrativo/planillaController')
const detalleGastosController = require('../controllers/administrativo/detalleGastosController')
const detallePlanillaController = require('../controllers/administrativo/detallePlanillaController')

//CARPETA DE ARRENDAMIENTO
const arrendamientoController = require('../controllers/arrendamiento/arrendamientoController')
const centroController = require('../controllers/arrendamiento/centroController')
const clinicaController = require('../controllers/arrendamiento/clinicaController')

//CARPETA DE COMPRAS
const compraController = require('../controllers/compras/comprasController')
const proveedorController = require('../controllers/compras/proveedorController')
const destinoController = require('../controllers/compras/destinoController')
const contribuyenteController = require('../controllers/compras/contribuyentesController')

//CARPETA DE CONTABLE
const cobroController = require('../controllers/contable/cobroController')
const cierresController = require('../controllers/contable/cierresController');
const bancosController = require('../controllers/contable/bancosController')
const tipo_cuentaController = require('../controllers/contable/tipo_cuentaController')
const cuenta_bancariaController = require('../controllers/contable/cuenta_bancariaController')
const nomenclaturaController = require('../controllers/contable/nomenclaturaController')
const librosController = require('../controllers/contable/librosController')
const partidasController = require('../controllers/contable/partidasController')
const detallePartidasController = require('../controllers/contable/detallePartidasController')
const tipoCobroController = require('../controllers/contable/tipoCobroController')
const tipoMovimientoController = require('../controllers/contable/tipoMovimientoController')

//CARPETA DE EMPLEADOS
const detalle_permisosController = require('../controllers/empleados/detalle_permisosController');
const userController = require('../controllers/empleados/usuarioController');
const userTypeController = require('../controllers/empleados/tipoUsuarioController');

//CARPETA GALO TECH
const equipogalotechController = require('../controllers/galo-tech/equipogalotechController')
const inventariogalotechController = require('../controllers/galo-tech/inventariogalotechController')
const tipo_equipoController = require('../controllers/galo-tech/tipo_equipoController')

//CARPETA DE INVENTARIO
const casa_medicaController = require('../controllers/inventario/casa_medicaController')
const inventarioController = require('../controllers/inventario/inventarioController')
const marcaController = require('../controllers/inventario/marcaController')
const medicamentoController = require('../controllers/inventario/medicamentoController')
const medicamento_externoController = require('../controllers/inventario/medicamento_externoController')
const presentacionController = require('../controllers/inventario/presentacionController')
const tipo_medicamentoController = require('../controllers/inventario/tipo_medicamentoController')

//CARPETA DE LABORATORIO
const campo_examenController = require('../controllers/laboratorio/campo_examenController.js');
const campo_resultadoController = require('../controllers/laboratorio/campo_resultadoController.js');
const equipoController = require('../controllers/laboratorio/equipoController.js');
const examenController = require('../controllers/laboratorio/examenController.js');
const examen_externoController = require('../controllers/laboratorio/examen_externoController.js');
const insumo_laboratorioController = require('../controllers/laboratorio/insumo_laboratorioController.js');
const inventario_laboratorioController = require('../controllers/laboratorio/inventario_laboratorioController.js');
const ordenController = require('../controllers/laboratorio/ordenController.js');
const resultadoController = require('../controllers/laboratorio/resultadoController');
const tipo_examenController = require('../controllers/laboratorio/tipo_examenController.js');
const tipo_insumo_laboratorioController = require('../controllers/laboratorio/tipo_insumo_laboratorioController.js');

//CARPETA DE MEDICOS
const specialtiesController = require('../controllers/medicos/especialidadController');
const medicoController = require('../controllers/medicos/medicoController')
const tipo_medicoController = require('../controllers/medicos/tipo_medicoController')

//CARPETA DE PACIENTES
const consultaController = require('../controllers/pacientes/consultaController')
const notaController = require('../controllers/pacientes/notaController')
const pacienteController = require ('../controllers/pacientes/pacienteController')
const pacienteExpressController = require('../controllers/pacientes/pacientesExpressController')
const idiomaController = require('../controllers/pacientes/idiomaController')
const sangreController = require('../controllers/pacientes/sangreController')
const nacionalidadController = require('../controllers/pacientes/nacionalidadController')
const consultaLabController =  require('../controllers/pacientes/consultaLabController')

//FEATURES DE PACIENTES
const alergiasController = require('../controllers/pacientes/features/alergiasController')
const detail_recordController = require('../controllers/pacientes/features/detail_recordController')
const cargosController = require('../controllers/pacientes/features/cargosController')
const diagnosticoController = require('../controllers/pacientes/features/diagnosticoController')
const documentosController = require('../controllers/pacientes/features/documentosController')
const pagosController = require('../controllers/pacientes/features/pagosController')
const radiologyController = require('../controllers/pacientes/features/radiologyController')
const recetaController = require('../controllers/pacientes/features/recetaController')
const recordController = require('../controllers/pacientes/features/recordController')
const vitalesController = require('../controllers/pacientes/features/vitalesController')
const vitalesNeuroController = require('../controllers/pacientes/features/vitalesNeuroController')
const vitalesGlicemiaController = require('../controllers/pacientes/features/vitalesGlicemiaController')
const segurosController = require('../controllers/pacientes/features/segurosController')
const citaRapidaController = require('../controllers/pacientes/features/citaRapidaController')
const lenguajesController = require('../controllers/pacientes/features/lenguajesController')
const psicologiaController = require('../controllers/pacientes/features/psicologiaController')
const fisioterapiaController = require('../controllers/pacientes/features/fisioterapiaController')

//CARPETA DE SERVICIOS
const serviciosController = require('../controllers/servicios/serviciosController')
const geneticaController = require('../controllers/servicios/geneticaController')
const terapiasController = require('../controllers/servicios/terapiasController')

//CARPETA DE VENTAS
const clienteController = require('../controllers/ventas/clienteController')
const ventaController = require('../controllers/ventas/ventaController');
const movimientosController = require('../controllers/contable/movimientosController');

//RUTAS

module.exports = (app) => {

    //FAVOR DE DEJAR ORGANIZADO POR CARPETAS EN ORDEN ALFABETICO
    //CARPETA DE ADMINISTRATIVO
    //gastos
    router.get('/gastos/list', gastosController.list);
    router.post('/gastos/create', gastosController.create);
    router.put('/gastos/update', gastosController.update);
    router.put('/gastos/activate', gastosController.activate);
    router.put('/gastos/deactivate', gastosController.deactivate);
    router.get('/gastos/get', gastosController.get);
    router.get('/gastos/getSelect', gastosController.getSearch);

    //ingresos
    router.get('/ingresos/list', ingresosController.list);
    router.post('/ingresos/create', ingresosController.create);
    router.put('/ingresos/update', ingresosController.update);
    router.put('/ingresos/activate', ingresosController.activate);
    router.put('/ingresos/deactivate', ingresosController.deactivate);
    router.get('/ingresos/get', ingresosController.get);
    router.get('/ingresos/getSelect', ingresosController.getSearch);

    //planillas
    router.get('/planillas/list', planillaController.list);
    router.post('/planillas/create', planillaController.create);
    router.put('/planillas/update', planillaController.update);
    router.put('/planillas/activate', planillaController.activate);
    router.put('/planillas/deactivate', planillaController.deactivate);
    router.get('/planillas/get', planillaController.get);
    router.get('/planillas/getSelect', planillaController.getSearch);

    //detalle_gastos
    router.get('/detalle_gastos/list', detalleGastosController.list);
    router.post('/detalle_gastos/create', detalleGastosController.create);
    router.put('/detalle_gastos/update', detalleGastosController.update);
    router.put('/detalle_gastos/activate', detalleGastosController.activate);
    router.put('/detalle_gastos/deactivate', detalleGastosController.deactivate);
    router.get('/detalle_gastos/get', detalleGastosController.get);
    router.get('/detalle_gastos/getSelect', detalleGastosController.getSearch);

    //detalle_planilla
    router.get('/detalle_planilla/list', detallePlanillaController.list);
    router.post('/detalle_planilla/create', detallePlanillaController.create);
    router.put('/detalle_planilla/update', detallePlanillaController.update);
    router.put('/detalle_planilla/activate', detallePlanillaController.activate);
    router.put('/detalle_planilla/deactivate', detallePlanillaController.deactivate);
    router.get('/detalle_planilla/get', detallePlanillaController.get);
    router.get('/detalle_planilla/getSelect', detallePlanillaController.getSearch);

    //CARPETA DE ARRENDAMIENTO
    
    // arrendamiento
    router.get('/arrendamiento/list', arrendamientoController.list);
    router.post('/arrendamiento/create', arrendamientoController.create);
    router.put('/arrendamiento/update', arrendamientoController.update);
    router.put('/arrendamiento/activate', arrendamientoController.activate);
    router.put('/arrendamiento/deactivate', arrendamientoController.deactivate);

    // centro
    router.get('/centro/list', centroController.list);
    router.post('/centro/create', centroController.create);
    router.put('/centro/update', centroController.update);
    router.put('/centro/activate', centroController.activate);
    router.put('/centro/deactivate', centroController.deactivate);
    router.get('/centro/get', centroController.get);

    // clinica
    router.get('/clinica/list', clinicaController.list);
    router.post('/clinica/create', clinicaController.create);
    router.put('/clinica/update', clinicaController.update);
    router.put('/clinica/activate', clinicaController.activate);
    router.put('/clinica/deactivate', clinicaController.deactivate);
    router.get('/clinica/getSearch', clinicaController.getSearch);

    //CARPETA DE COMPRAS
    //compras
    router.get('/compras/list', compraController.list);
    router.post('/compras/create', compraController.create);
    router.put('/compras/update', compraController.update);
    router.put('/compras/activate', compraController.activate);
    router.put('/compras/deactivate', compraController.deactivate);
    router.get('/compras/getToday', compraController.getToday);
    router.get('/compras/especifico', compraController.getEspecifico);


    //destino
    router.get('/destino/list', destinoController.list);
    router.post('/destino/create', destinoController.create);
    router.put('/destino/update', destinoController.update);
    router.put('/destino/activate', destinoController.activate);
    router.put('/destino/deactivate', destinoController.deactivate);
    router.get('/destino/get', destinoController.get);
    router.get('/destino/getSelect', destinoController.getSearch);

    //contribuyente
    router.get('/contribuyente/list', contribuyenteController.list);
    router.post('/contribuyente/create', contribuyenteController.create);
    router.put('/contribuyente/update', contribuyenteController.update);
    router.put('/contribuyente/activate', contribuyenteController.activate);
    router.put('/contribuyente/deactivate', contribuyenteController.deactivate);
    router.get('/contribuyente/get', contribuyenteController.get);
    router.get('/contribuyente/getSelect', contribuyenteController.getSearch);

    //proveedor
    router.get('/proveedor/list', proveedorController.list);
    router.post('/proveedor/create', proveedorController.create);
    router.put('/proveedor/update', proveedorController.update);
    router.put('/proveedor/activate', proveedorController.activate);
    router.put('/proveedor/deactivate', proveedorController.deactivate);
    router.get('/proveedor/get', proveedorController.get);
    router.get('/proveedor/getSelect', proveedorController.getSearch);

    //CARPETA DE CONTABLE
    //cierre
    router.get('/cierre/diario', cierresController.getDiario)
    router.get('/cierre/especifico', cierresController.getEspecifico)

    //cobro
    router.get('/cobro/list', cobroController.list);
    router.post('/cobro/create', cobroController.create);
    router.put('/cobro/update', cobroController.update);
    router.put('/cobro/activate', cobroController.activate);
    router.put('/cobro/deactivate', cobroController.deactivate);

    //banco
    router.get('/banco/list', bancosController.list);
    router.post('/banco/create', bancosController.create);
    router.put('/banco/update', bancosController.update);
    router.put('/banco/activate', bancosController.activate);
    router.put('/banco/deactivate', bancosController.deactivate);
    router.get('/banco/get', bancosController.get);
    router.get('/banco/getSelect', bancosController.getSearch);

    //tipo_cuenta
    router.get('/tipo_cuenta/list', tipo_cuentaController.list);
    router.post('/tipo_cuenta/create', tipo_cuentaController.create);
    router.put('/tipo_cuenta/update', tipo_cuentaController.update);
    router.put('/tipo_cuenta/activate', tipo_cuentaController.activate);
    router.put('/tipo_cuenta/deactivate', tipo_cuentaController.deactivate);
    router.get('/tipo_cuenta/get', tipo_cuentaController.get);
    router.get('/tipo_cuenta/getSelect', tipo_cuentaController.getSearch);

    //cuenta_bancaria
    router.get('/cuenta_bancaria/list', cuenta_bancariaController.list);
    router.post('/cuenta_bancaria/create', cuenta_bancariaController.create);
    router.put('/cuenta_bancaria/update', cuenta_bancariaController.update);
    router.put('/cuenta_bancaria/activate', cuenta_bancariaController.activate);
    router.put('/cuenta_bancaria/deactivate', cuenta_bancariaController.deactivate);
    router.get('/cuenta_bancaria/get', cuenta_bancariaController.get);
    router.get('/cuenta_bancaria/getSelect', cuenta_bancariaController.getSearch);

    //movimiento
    router.get('/movimiento/list', movimientosController.list);
    router.post('/movimiento/create', movimientosController.create);
    router.post('/movimiento/create_partida', movimientosController.create_partida);
    router.put('/movimiento/update', movimientosController.update);
    router.put('/movimiento/activate', movimientosController.activate);
    router.put('/movimiento/deactivate', movimientosController.deactivate);
    router.get('/movimiento/get', movimientosController.get);
    router.get('/movimiento/getSelect', movimientosController.getSearch);
    router.get('/movimiento/getPartidas', movimientosController.getPartidas);

    //nomenclatura
    router.get('/nomenclatura/list', nomenclaturaController.list);
    router.post('/nomenclatura/create', nomenclaturaController.create);
    router.put('/nomenclatura/update', nomenclaturaController.update);
    router.put('/nomenclatura/activate', nomenclaturaController.activate);
    router.put('/nomenclatura/deactivate', nomenclaturaController.deactivate);
    router.get('/nomenclatura/get', nomenclaturaController.get);
    router.get('/nomenclatura/getSelect', nomenclaturaController.getSearch);

    //libros
    router.get('/libros/compras/list', librosController.listCompras);
    router.get('/libros/compras/get', librosController.getCompras);
    router.get('/libros/ventas/list', librosController.listVentas);
    router.get('/libros/ventas/get', librosController.getVentas);
    router.get('/libros/diario/list', librosController.listDiario);
    router.get('/libros/diario/get', librosController.getDiario);
    router.get('/libros/mayor/list', librosController.listMayor);
    router.get('/libros/mayor/get', librosController.getMayor);
    router.get('/libros/balances/list', librosController.listBalances);
    router.get('/libros/balances/get', librosController.getBalances);
    router.get('/libros/bancos/list', librosController.listBancos);
    router.get('/libros/bancos/get', librosController.getBancos);
    router.get('/libros/resultados/list', librosController.listEstadoResultados);
    router.get('/libros/resultados/get', librosController.getEstadoResultados);
    router.get('/libros/efectivo/list', librosController.listFlujoEfectivo);
    router.get('/libros/efectivo/get', librosController.getFlujoEfectivo);
    router.get('/libros/conciliacion/list', librosController.listConciliacionBancaria);
    router.get('/libros/conciliacion/get', librosController.getConciliacionBancaria);

    //partidas
    router.get('/partidas/list', partidasController.list);
    router.post('/partidas/create', partidasController.create);
    router.put('/partidas/update', partidasController.update);
    router.put('/partidas/activate', partidasController.activate);
    router.put('/partidas/deactivate', partidasController.deactivate);
    router.get('/partidas/get', partidasController.get);
    router.get('/partidas/getSelect', partidasController.getSearch);
    router.get('/partidas/especifico', partidasController.getEspecifico);
    router.get('/partidas/find', partidasController.find);
    router.get('/partidas/especifico', partidasController.getEspecifico)
    router.get('/partidas/diario', partidasController.getDiario)

    //detalle_partidas
    router.get('/detalle_partidas/especifico', detallePartidasController.getEspecifico)
    router.get('/detalle_partidas/mayor', detallePartidasController.getMayor)

    //tipo_cobro
    router.get('/tipo_cobro/list', tipoCobroController.list);
    router.post('/tipo_cobro/create', tipoCobroController.create);
    router.put('/tipo_cobro/update', tipoCobroController.update);
    router.put('/tipo_cobro/activate', tipoCobroController.activate);
    router.put('/tipo_cobro/deactivate', tipoCobroController.deactivate);
    router.get('/tipo_cobro/get', tipoCobroController.get);
    router.get('/tipo_cobro/getSelect', tipoCobroController.getSearch);

    //tipo_movimiento
    router.get('/tipo_movimiento/list', tipoMovimientoController.list);
    router.post('/tipo_movimiento/create', tipoMovimientoController.create);
    router.put('/tipo_movimiento/update', tipoMovimientoController.update);
    router.put('/tipo_movimiento/activate', tipoMovimientoController.activate);
    router.put('/tipo_movimiento/deactivate', tipoMovimientoController.deactivate);
    router.get('/tipo_movimiento/get', tipoMovimientoController.get);
    router.get('/tipo_movimiento/getSelect', tipoMovimientoController.getSearch);

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

    //CARPETA DE GALO TECH
    //equipo
    router.get('/equipo_galo_tech/list', equipogalotechController.list);
    router.post('/equipo_galo_tech/create', equipogalotechController.create);
    router.put('/equipo_galo_tech/update', equipogalotechController.update);
    router.put('/equipo_galo_tech/activate', equipogalotechController.activate);
    router.put('/equipo_galo_tech/deactivate', equipogalotechController.deactivate);
    router.get('/equipo_galo_tech/getSearch', equipogalotechController.getSearch);

    //inventario
    router.get('/inventario_galo_tech/list', inventariogalotechController.list);
    router.post('/inventario_galo_tech/create', inventariogalotechController.create);
    router.put('/inventario_galo_tech/update', inventariogalotechController.update);
    router.put('/inventario_galo_tech/activate', inventariogalotechController.activate);
    router.put('/inventario_galo_tech/deactivate', inventariogalotechController.deactivate);

    //tipo_equipo
    router.get('/tipo_equipo/list', tipo_equipoController.list);
    router.post('/tipo_equipo/create', tipo_equipoController.create);
    router.put('/tipo_equipo/update', tipo_equipoController.update);
    router.put('/tipo_equipo/activate', tipo_equipoController.activate);
    router.put('/tipo_equipo/deactivate', tipo_equipoController.deactivate);
    router.get('/tipo_equipo/get', tipo_equipoController.get);

    //CARPETA DE INVENTARIO
    //casa_medica
    router.get('/casa_medica/list', casa_medicaController.list);
    router.post('/casa_medica/create', casa_medicaController.create);
    router.put('/casa_medica/update', casa_medicaController.update);
    router.put('/casa_medica/activate', casa_medicaController.activate);
    router.put('/casa_medica/deactivate', casa_medicaController.deactivate);
    router.get('/casa_medica/get', casa_medicaController.get);

    //inventario
    router.get('/inventario/list', inventarioController.list);
    router.post('/inventario/create', inventarioController.create);
    router.put('/inventario/update', inventarioController.update);
    router.put('/inventario/activate', inventarioController.activate);
    router.put('/inventario/deactivate', inventarioController.deactivate);

    //marca
    router.get('/marca/list', marcaController.list);
    router.post('/marca/create', marcaController.create);
    router.put('/marca/update', marcaController.update);
    router.put('/marca/activate', marcaController.activate);
    router.put('/marca/deactivate', marcaController.deactivate);
    router.get('/marca/get', marcaController.get);

    //medicamento
    router.get('/medicamento/list', medicamentoController.list);
    router.post('/medicamento/create', medicamentoController.create);
    router.put('/medicamento/update', medicamentoController.update);
    router.put('/medicamento/activate', medicamentoController.activate);
    router.put('/medicamento/deactivate', medicamentoController.deactivate);
    router.get('/medicamento/getSelect', medicamentoController.getSearch);

    //medicamento_externo
    router.get('/medicamento_externo/list', medicamento_externoController.list);
    router.post('/medicamento_externo/create', medicamento_externoController.create);
    router.put('/medicamento_externo/update', medicamento_externoController.update);
    router.put('/medicamento_externo/activate', medicamento_externoController.activate);
    router.put('/medicamento_externo/deactivate', medicamento_externoController.deactivate);
    router.get('/medicamento_externo/getSelect', medicamento_externoController.getSearch);

    //presentacion
    router.get('/presentacion/list', presentacionController.list);
    router.post('/presentacion/create', presentacionController.create);
    router.put('/presentacion/update', presentacionController.update);
    router.put('/presentacion/activate', presentacionController.activate);
    router.put('/presentacion/deactivate', presentacionController.deactivate);
    router.get('/presentacion/get', presentacionController.get);

    //tipo_medicamento
    router.get('/tipo_medicamento/list', tipo_medicamentoController.list);
    router.post('/tipo_medicamento/create', tipo_medicamentoController.create);
    router.put('/tipo_medicamento/update', tipo_medicamentoController.update);
    router.put('/tipo_medicamento/activate', tipo_medicamentoController.activate);
    router.put('/tipo_medicamento/deactivate', tipo_medicamentoController.deactivate);
    router.get('/tipo_medicamento/get', tipo_medicamentoController.get);

    //CARPETA DE LABORATORIO
    //campo_examen
    router.get('/campo_examen/list', campo_examenController.list);
    router.post('/campo_examen/create', campo_examenController.create);
    router.put('/campo_examen/update', campo_examenController.update);
    router.put('/campo_examen/activate', campo_examenController.activate);
    router.put('/campo_examen/deactivate', campo_examenController.deactivate);

    //campo_resultado
    router.get('/campo_resultado/list', campo_resultadoController.list);
    router.post('/campo_resultado/create', campo_resultadoController.create);
    router.put('/campo_resultado/update', campo_resultadoController.update);
    router.put('/campo_resultado/activate', campo_resultadoController.activate);
    router.put('/campo_resultado/deactivate', campo_resultadoController.deactivate);

    //equipo
    router.get('/equipo/list', equipoController.list);
    router.post('/equipo/create', equipoController.create);
    router.put('/equipo/update', equipoController.update);
    router.put('/equipo/activate', equipoController.activate);
    router.put('/equipo/deactivate', equipoController.deactivate);

    //examen
    router.get('/examen/list', examenController.list);
    router.post('/examen/create', examenController.create);
    router.put('/examen/update', examenController.update);
    router.put('/examen/activate', examenController.activate);
    router.put('/examen/deactivate', examenController.deactivate);
    router.get('/examen/get', examenController.get);
    router.get('/examen/getSelect', examenController.getSearch);

    //examen_externo
    router.get('/examen_externo/list', examen_externoController.list);
    router.post('/examen_externo/create', examen_externoController.create);
    router.put('/examen_externo/update', examen_externoController.update);
    router.put('/examen_externo/activate', examen_externoController.activate);
    router.put('/examen_externo/deactivate', examen_externoController.deactivate);
    router.get('/examen_externo/get', examen_externoController.get);
    router.get('/examen_externo/getSelect', examen_externoController.getSearch);

    //insumo_laboratorio
    router.get('/insumo_laboratorio/list', insumo_laboratorioController.list);
    router.post('/insumo_laboratorio/create', insumo_laboratorioController.create);
    router.put('/insumo_laboratorio/update', insumo_laboratorioController.update);
    router.put('/insumo_laboratorio/activate', insumo_laboratorioController.activate);
    router.put('/insumo_laboratorio/deactivate', insumo_laboratorioController.deactivate);
    router.get('/insumo_laboratorio/getSelect', insumo_laboratorioController.getSearch);

    //inventario_laboratorio
    router.get('/inventario_laboratorio/list', inventario_laboratorioController.list);
    router.post('/inventario_laboratorio/create', inventario_laboratorioController.create);
    router.put('/inventario_laboratorio/update', inventario_laboratorioController.update);
    router.put('/inventario_laboratorio/activate', inventario_laboratorioController.activate);
    router.put('/inventario_laboratorio/deactivate', inventario_laboratorioController.deactivate);

    //orden
    router.get('/orden/list', ordenController.list);
    router.post('/orden/create', ordenController.create);
    router.put('/orden/update', ordenController.update);
    router.put('/orden/activate', ordenController.activate);
    router.put('/orden/deactivate', ordenController.deactivate);

    //resultado
    router.get('/resultado/get', resultadoController.get);

    //tipo_examen
    router.get('/tipo_examen/list', tipo_examenController.list);
    router.post('/tipo_examen/create', tipo_examenController.create);
    router.put('/tipo_examen/update', tipo_examenController.update);
    router.put('/tipo_examen/activate', tipo_examenController.activate);
    router.put('/tipo_examen/deactivate', tipo_examenController.deactivate);
    router.get('/tipo_examen/get', tipo_examenController.get);

    //tipo_insumo_laboratorio
    router.get('/tipo_insumo_laboratorio/list', tipo_insumo_laboratorioController.list);
    router.post('/tipo_insumo_laboratorio/create', tipo_insumo_laboratorioController.create);
    router.put('/tipo_insumo_laboratorio/update', tipo_insumo_laboratorioController.update);
    router.put('/tipo_insumo_laboratorio/activate', tipo_insumo_laboratorioController.activate);
    router.put('/tipo_insumo_laboratorio/deactivate', tipo_insumo_laboratorioController.deactivate);
    router.get('/tipo_insumo_laboratorio/get', tipo_insumo_laboratorioController.get);

    //CARPETA DE MEDICOS
    
    // especialidades
    router.get('/specialty/list', specialtiesController.list);
    router.post('/specialty/create', specialtiesController.create);
    router.put('/specialty/update', specialtiesController.update);
    router.put('/specialty/activate', specialtiesController.activate);
    router.put('/specialty/deactivate', specialtiesController.deactivate);
    router.get('/specialty/get', specialtiesController.get);

    // medicos
    router.get('/medico/list', medicoController.list);
    router.post('/medico/create', medicoController.create);
    router.put('/medico/update', medicoController.update);
    router.put('/medico/activate', medicoController.activate);
    router.put('/medico/deactivate', medicoController.deactivate);
    router.get('/medico/getSearch', medicoController.getSearch)

    // tipo_medico
    router.get('/tipo_medico/list', tipo_medicoController.list);
    router.post('/tipo_medico/create', tipo_medicoController.create);
    router.put('/tipo_medico/update', tipo_medicoController.update);
    router.put('/tipo_medico/activate', tipo_medicoController.activate);
    router.put('/tipo_medico/deactivate', tipo_medicoController.deactivate);
    router.get('/tipo_medico/get', tipo_medicoController.get);

    //CARPETA DE PACIENTES

    // consulta
    router.get('/consulta/list', consultaController.list);
    router.get('/consulta/calendar', consultaController.calendar);
    router.get('/consulta/today_calendar', consultaController.todayCalendar);
    router.get('/consulta/waitList', consultaController.waitList);
    router.post('/consulta/create', consultaController.create);
    router.put('/consulta/update', consultaController.update);
    router.put('/consulta/activate', consultaController.activate);
    router.put('/consulta/deactivate', consultaController.deactivate);
    router.delete('/consulta/delete', consultaController.delete);
    router.get('/consulta/delayed', consultaController.findDelayed);
    router.get('/consulta/ontime', consultaController.findOnTime);
    router.get('/consulta/canceled', consultaController.findCanceled);
    router.get('/consulta/medic', consultaController.findByMedic);
    router.get('/consulta/secretary', consultaController.findBySecretary);
    router.get('/consulta/get', consultaController.get);
    router.put('/consulta/sendWaitList', consultaController.sendWaitList)
    router.put('/consulta/sendHistory', consultaController.sendHistory)

    // notas
    router.get('/nota/list', notaController.list);
    router.post('/nota/create', notaController.create);
    router.put('/nota/update', notaController.update);
    router.put('/nota/activate', notaController.activate);
    router.put('/nota/deactivate', notaController.deactivate);

    // pacientes
    router.get('/paciente/list', pacienteController.list);
    router.post('/paciente/create', pacienteController.create);
    router.put('/paciente/update', pacienteController.update);
    router.put('/paciente/activate', pacienteController.activate);
    router.put('/paciente/deactivate', pacienteController.deactivate);
    router.get('/paciente/get', pacienteController.get);

    // pacientes express
    router.get('/paciente_express/list', pacienteExpressController.list);
    router.post('/paciente_express/create', pacienteExpressController.create);
    router.put('/paciente_express/update', pacienteExpressController.update);
    router.put('/paciente_express/transform', pacienteExpressController.transform)
    router.get('/paciente_express/get', pacienteExpressController.get);

    // pacientes seguro
    router.get('/seguros/list', segurosController.list);
    router.post('/seguros/create', segurosController.create);
    router.put('/seguros/update', segurosController.update);
    router.put('/seguros/activate', segurosController.activate);
    router.put('/seguros/deactivate', segurosController.deactivate);

    // idioma
    router.get('/idioma/get', idiomaController.get);

    // nacionalidad
    router.get('/nacionalidad/get', nacionalidadController.get);
    router.post('/nacionalidad/create', nacionalidadController.create);

    // sangre
    router.get('/sangre/get', sangreController.get);

    //FEATURES DE PACIENTES

    //cita paciente
    router.get('/cita/list', consultaController.listConsultapaciente);
    router.get('/visita/list', consultaController.visitasConsultapaciente);
    router.post('/citarapida/create', citaRapidaController.create);
    router.post('/citarapida/createLab', citaRapidaController.create_lab);
    router.post('/laboratoriorapido/create', citaRapidaController.create);

    //alergias
    router.post('/alergias/create', alergiasController.create);
    router.put('/alergias/update', alergiasController.update);
    router.put('/alergias/activate', alergiasController.activate);
    router.put('/alergias/deactivate', alergiasController.deactivate);
    router.get('/alergias/get', alergiasController.get);
    router.get('/alergias/list', alergiasController.list);

    //cargos
    router.post('/cargos/create', cargosController.create);
    router.put('/cargos/update', cargosController.update);
    router.put('/cargos/activate', cargosController.activate);
    router.put('/cargos/deactivate', cargosController.deactivate);
    router.get('/cargos/get', cargosController.get);
    router.get('/cargos/list', cargosController.list);

    // diagnostico
    router.post('/diagnostico/create', diagnosticoController.create);
    router.put('/diagnostico/update', diagnosticoController.update);
    router.put('/diagnostico/activate', diagnosticoController.activate);
    router.put('/diagnostico/deactivate', diagnosticoController.deactivate);
    router.get('/diagnostico/get', diagnosticoController.get);
    router.get('/diagnostico/list', diagnosticoController.list);

    //detail_record
    router.post('/detail_record/create', detail_recordController.create);
    router.put('/detail_record/update', detail_recordController.update);
    router.put('/detail_record/activate', detail_recordController.activate);
    router.put('/detail_record/deactivate', detail_recordController.deactivate);
    router.get('/detail_record/get', detail_recordController.get);

    // orden
    router.post('/orden/create', ordenController.create);
    router.put('/orden/update', ordenController.update);
    router.put('/orden/activate', ordenController.activate);
    router.put('/orden/deactivate', ordenController.deactivate);
    router.get('/orden/get', ordenController.get);
    router.get('/orden/list', ordenController.list);


    //documentos
    router.post('/documentos/create', documentosController.create);
    router.post('/documentos/upload', upload.single("file"), documentosController.upload);
    router.put('/documentos/update', documentosController.update);
    router.put('/documentos/activate', documentosController.activate);
    router.put('/documentos/deactivate', documentosController.deactivate);
    router.get('/documentos/get', documentosController.get);
    router.get('/documentos/getDocument', documentosController.getDocument);
    router.get('/documentos/list', documentosController.list);

    //fisioterapia
    router.post('/fisioterapia/create', fisioterapiaController.create);
    router.put('/fisioterapia/update', fisioterapiaController.update);
    router.put('/fisioterapia/activate', fisioterapiaController.activate);
    router.put('/fisioterapia/deactivate', fisioterapiaController.deactivate);
    router.get('/fisioterapia/get', fisioterapiaController.get);
    router.get('/documentos/list', documentosController.list);

    //lenguaje
    router.post('/lenguaje/create', lenguajesController.create);
    router.put('/lenguaje/update', lenguajesController.update);
    router.put('/lenguaje/activate', lenguajesController.activate);
    router.put('/lenguaje/deactivate', lenguajesController.deactivate);
    router.get('/lenguaje/get', lenguajesController.get);
    router.get('/lenguaje/list', lenguajesController.list);

    //pagos
    router.post('/pagos/create', pagosController.create);
    router.put('/pagos/update', pagosController.update);
    router.put('/pagos/activate', pagosController.activate);
    router.put('/pagos/deactivate', pagosController.deactivate);
    router.get('/pagos/get', pagosController.get);

    //psicologia
    router.post('/psicologia/create', psicologiaController.create);
    router.put('/psicologia/update', psicologiaController.update);
    router.put('/psicologia/activate', psicologiaController.activate);
    router.put('/psicologia/deactivate', psicologiaController.deactivate);
    router.get('/psicologia/get', psicologiaController.get);
    router.get('/psicologia/list', psicologiaController.list);

    //radiologia
    router.post('/radiologia/create', radiologyController.create);
    router.post('/radiologia/upload', upload.single("file"), radiologyController.upload);
    router.put('/radiologia/update', radiologyController.update);
    router.put('/radiologia/activate', radiologyController.activate);
    router.put('/radiologia/deactivate', radiologyController.deactivate);
    router.get('/radiologia/get', radiologyController.get);
    router.get('/radiologia/getDocument', radiologyController.getDocument);
    router.get('/radiologia/list', radiologyController.list);

    // recetas
    router.post('/receta/create', recetaController.create);
    router.put('/receta/update', recetaController.update);
    router.put('/receta/activate', recetaController.activate);
    router.put('/receta/deactivate', recetaController.deactivate);
    router.get('/receta/get', recetaController.get);
    router.get('/receta/list', recetaController.list);

    //record
    router.post('/record/create', recordController.create);
    router.put('/record/update', recordController.update);
    router.put('/record/activate', recordController.activate);
    router.put('/record/deactivate', recordController.deactivate);
    router.get('/record/get', recordController.get);

    //vitales
    router.post('/vitales/create', vitalesController.create);
    router.put('/vitales/update', vitalesController.update);
    router.put('/vitales/activate', vitalesController.activate);
    router.put('/vitales/deactivate', vitalesController.deactivate);
    router.get('/vitales/get', vitalesController.get);
    router.get('/vitales/list', vitalesController.list);

    //vitales_glicemia
    router.post('/vitales_glicemia/create', vitalesGlicemiaController.create);
    router.put('/vitales_glicemia/update', vitalesGlicemiaController.update);
    router.put('/vitales_glicemia/activate', vitalesGlicemiaController.activate);
    router.put('/vitales_glicemia/deactivate', vitalesGlicemiaController.deactivate);
    router.get('/vitales_glicemia/get', vitalesGlicemiaController.get);
    router.get('/vitales_glicemia/list', vitalesGlicemiaController.list);

    //vitales_neuro
    router.post('/vitales_neuro/create', vitalesNeuroController.create);
    router.put('/vitales_neuro/update', vitalesNeuroController.update);
    router.put('/vitales_neuro/activate', vitalesNeuroController.activate);
    router.put('/vitales_neuro/deactivate', vitalesNeuroController.deactivate);
    router.get('/vitales_neuro/get', vitalesNeuroController.get);
    router.get('/vitales_neuro/list', vitalesNeuroController.list);

    //CARPETA DE SERVICIOS
    //servicios
    router.get('/servicios/list', serviciosController.list);
    router.post('/servicios/create', serviciosController.create);
    router.put('/servicios/update', serviciosController.update);
    router.put('/servicios/activate', serviciosController.activate);
    router.put('/servicios/deactivate', serviciosController.deactivate);
    router.get('/servicios/get', serviciosController.get);
    router.get('/servicios/getSelect', serviciosController.getSearch);

     //genetica
     router.get('/genetica/list', geneticaController.list);
     router.post('/genetica/create', geneticaController.create);
     router.put('/genetica/update', geneticaController.update);
     router.put('/genetica/activate', geneticaController.activate);
     router.put('/genetica/deactivate', geneticaController.deactivate);
     router.get('/genetica/get', geneticaController.get);
     router.get('/genetica/getSelect', geneticaController.getSearch);

    //terapias
    router.get('/terapias/list', terapiasController.list);
    router.post('/terapias/create', terapiasController.create);
    router.put('/terapias/update', terapiasController.update);
    router.put('/terapias/activate', terapiasController.activate);
    router.put('/terapias/deactivate', terapiasController.deactivate);
    router.get('/terapias/get', terapiasController.get);
    router.get('/terapias/getSelect', terapiasController.getSearch);

    //CARPETA DE VENTAS
    //clientes
    router.get('/clientes/list', clienteController.list);
    router.post('/clientes/create', clienteController.create);
    router.put('/clientes/update', clienteController.update);
    router.put('/clientes/activate', clienteController.activate);
    router.put('/clientes/deactivate', clienteController.deactivate);

    //ventas
    router.get('/ventas/list', ventaController.list);
    router.get('/ventas/listAccounting', ventaController.listAccounting);
    router.post('/ventas/create', ventaController.create);
    router.put('/ventas/update', ventaController.update);
    router.put('/ventas/activate', ventaController.activate);
    router.put('/ventas/deactivate', ventaController.deactivate);
    router.get('/ventas/get', ventaController.get)
    router.get('/ventas/getToday', ventaController.getToday)
    router.get('/ventas/especifico', ventaController.getEspecifico)
    
    //AUTH
    router.post('/login', authController.login);
    router.post('/refresh', authController.refresh);
    router.post('/logout', authController.logout);
    router.post('/autenticar', auth, authController.autenticar);

    // consulta lab
    router.post('/consulta/laboratorio/create', consultaLabController.create);
    router.put('/consulta/laboratorio/update', consultaLabController.update);
    router.delete('/consulta/laboratorio/delete', consultaLabController.delete);
    router.get('/consulta/laboratorio/calendar', consultaLabController.calendar);
    router.get('/consulta/laboratorio/today_calendar', consultaLabController.todayCalendar);
    router.get('/consulta/laboratorio/waitList', consultaLabController.waitList);
    router.put('/consulta/laboratorio/sendWaitList', consultaLabController.sendWaitList)
    router.put('/consulta/laboratorio/sendHistory', consultaLabController.sendHistory)



    app.use('/', router);
};