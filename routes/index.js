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
const consumosController = require('../controllers/caja/consumosController')
const cuentasController = require('../controllers/caja/cuentasController')
const detallePagoSegurosController = require('../controllers/caja/pagoSegurosController.js')
const expedientesController = require('../controllers/caja/expedientesController')
const aseguradorasController = require('../controllers/caja/aseguradorasController')
const segurosController = require('../controllers/caja/segurosController')
const rubrosController = require('../controllers/caja/rubrosController')
const cajaChicaController = require('../controllers/caja/cajaChicaController')

//CARPETA DE ENFERMERIA
const habitacionesController = require('../controllers/enfermeria/habitacionesController')
const pedidosController = require('../controllers/enfermeria/pedidosController')
const detallePedidosController = require('../controllers/enfermeria/detallePedidosController')
const servicioSalaOperacionesController = require('../controllers/enfermeria/servicioSalaOperacionesController')
const CategoriaSalaOperacionesController = require('../controllers/enfermeria/categoriaSalaOperacionesController')

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
const detalle_consumo_medicamentos = require('../controllers/farmacia/consumoMedicamentosController.js')
const detalle_consumo_quirugicos = require('../controllers/farmacia/consumoQuirurgicosController.js')
const detalle_consumo_comunes = require('../controllers/farmacia/consumoComunController.js')

//CARPETA DE GERENCIA
const AsuetosController = require('../controllers/gerencia/asuetosController')

//CARPETA DE HONORARIOS
const detalleHonorariosController = require('../controllers/honorarios/detalleHonorariosController')

//CARPETA DE INVENTARIO
const alimentacionController = require('../controllers/inventario/alimentacionController')
const alimentacionMovimientosController = require('../controllers/inventario/alimentacionMovimientosController')
const equiposController = require('../controllers/inventario/equiposController')
const equiposMovimientosController = require('../controllers/inventario/equiposMovimientosController')
const mantenimientosController = require('../controllers/inventario/mantenimientosController')

//CARPETA DE LABORATORIO
const examenesAlmacenadosController = require('../controllers/laboratorio/examenesAlmacenadosController.js')
const campoExamenController = require('../controllers/laboratorio/campoExamenController.js')
const labCuentasController = require('../controllers/laboratorio/labCuentasController')
const labDetalleCuentasController = require('../controllers/laboratorio/labDetalleCuentasController')
/* const labDetallePagoCuentasController = require('../controllers/laboratorio/labCuentasController')

 */

//CARPETA DE LIQUIDACIONES


//CARPETA DE MEDICOS
const especialidadesController = require('../controllers/medicos/especialidadesController')
const medicosController = require('../controllers/medicos/medicosController')
const sociosController = require('../controllers/medicos/sociosController')
const voucherHonorariosController = require('../controllers/medicos/voucher_honorariosController.js')

//CARPETA DE PACIENTES
const recetaController = require('../controllers/paciente/recetaController')
const evolucionController = require('../controllers/paciente/evolucionController')
const ordenController = require('../controllers/paciente/ordenController')

//CARPETA DE EMPLEADOS
const detalle_permisosController = require('../controllers/empleados/detalle_permisosController');
const userController = require('../controllers/empleados/usuarioController');
const userTypeController = require('../controllers/empleados/tipoUsuarioController');
const serviciosController = require('../controllers/enfermeria/serviciosController');
const encargadosController = require('../controllers/laboratorio/encargadosController');
const tipoEncargadoController = require('../controllers/laboratorio/tipoEncargadoController.js');
const tipoExamenController = require('../controllers/laboratorio/tipoExamenController');

// examenes realizados
const examenesRealizados = require('../controllers/laboratorio/examenesController')
// Detalle Examen Realizado
const detalleExamenRealizado = require('../controllers/laboratorio/detalleExamenRealizadoController.js');
const labPagoSegurosController = require('../controllers/caja/labPagoSegurosController.js');
const facturaController = require('../controllers/caja/facturaController.js');

// CARPETA DE REPORTES
const reportesCajaHospiController = require('../controllers/reportes/reportesCajaHospiController')
const reportesCajaLabController = require('../controllers/reportes/reportesCajaLabController')
const reportesFarmaciaController = require('../controllers/reportes/reportesFarmaciaController.js')
const reportesEnfermeriaController = require('../controllers/reportes/reportesEnfermeriaController')
const reportesExamenesController = require('../controllers/reportes/reportesExamenesController')
const reportesMedicosController = require('../controllers/reportes/reportesMedicosController')
const reportesPacientesController = require('../controllers/reportes/reportesPacientesController')


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

    //consumos
    router.get('/consumos/list', consumosController.list);
    router.post('/consumos/create', consumosController.create);
    router.put('/consumos/update', consumosController.update);
    router.put('/consumos/activate', consumosController.activate);
    router.put('/consumos/deactivate', consumosController.deactivate);
    router.get('/consumos/getSearch', consumosController.getSearch);
    router.get('/consumos/getId', consumosController.getId);
    router.get('/consumos/getById/:id',consumosController.obtenerConsumosPorIdCuenta);
    router.get('/consumos/historial/:id',consumosController.historialCuenta);
    router.get('/consumos/sumario/:id',consumosController.getDataSumario);


    //cuentas
    router.get('/cuentas/list', cuentasController.list);
    router.get('/cuentas/payList', cuentasController.listPay);
    router.get('/cuentas/debtList', cuentasController.listNoPay);
    router.get('/cuentas/get', cuentasController.get);
    router.get('/cuentas/getByExp', cuentasController.getByExp);
    router.get('/cuentas/pay', cuentasController.onPay);
    router.post('/cuentas/create', cuentasController.create);
    router.put('/cuentas/update', cuentasController.update);
    router.put('/cuentas/activate', cuentasController.activate);
    router.put('/cuentas/deactivate', cuentasController.deactivate);
    router.get('/cuentas/getSearch', cuentasController.getSearch);
    router.post('/cuentas/requestDiscount', cuentasController.DiscountRequest);
    router.get('/cuentas/listDiscount', cuentasController.listNoPayDiscountRequest);
    router.get('/cuentas/listCortesPerDate', cuentasController.listCortesPerDate);
    router.get('/cuentas/getByAccount', cuentasController.getByAccount);
    
    //Facturas
    router.post('/facturas/create', facturaController.create);
    router.post('/facturas/update', facturaController.update);
    router.post('/facturas/deactivate', facturaController.deactivate);
    router.get('/facturas/getList', facturaController.getList);
    
    //Seguros
    router.post('/seguros/create', segurosController.create);
    router.get('/seguros/list', segurosController.list);
    router.get('/seguros/debtList', segurosController.assurancePayList);
    router.put('/seguros/deactivate', segurosController.deactivate);
    router.put('/seguros/paid', segurosController.paid);
    router.put('/seguros/debt', segurosController.debt);
    router.get('/seguros/getByExp', segurosController.getAssuranceByExp);

    //Rubros
    router.post('/rubros/create', rubrosController.create);
    router.get('/rubros/list', rubrosController.list);
    router.get('/rubros/get', rubrosController.get);
    router.put('/rubros/update', rubrosController.update);
    router.put('/rubros/activate', rubrosController.activate);
    router.put('/rubros/deactivate', rubrosController.deactivate);

    //CajaChica
    router.post('/cajaChica/create', cajaChicaController.create);
    router.get('/cajaChica/list', cajaChicaController.list);

    //Aseguradoras
    router.post('/aseguradoras/create', aseguradorasController.create);
    router.get('/aseguradoras/get', aseguradorasController.get);

    //expedientes
    router.get('/expedientes/list', expedientesController.list);
    router.post('/expedientes/create', expedientesController.create);
    router.post('/expedientes/createEnfermeria', expedientesController.createFromEnfermeria);
    router.put('/expedientes/update', expedientesController.update);
    router.put('/expedientes/changeState', expedientesController.changeState);
    router.put('/expedientes/assignDoctor', expedientesController.updateMedico);
    router.put('/expedientes/assignRoom', expedientesController.asignarHabitacion);
    router.put('/expedientes/activate', expedientesController.activate);
    router.put('/expedientes/deactivate', expedientesController.deactivate);
    router.get('/expedientes/getSearch', expedientesController.getSearch)
    router.get('/expedientes/getSearcExamenes', expedientesController.getSearchExamenes)
    router.get('/expedientes/getAll', expedientesController.get);
    router.get('/expedientes/listQuirofano', expedientesController.listQuirofano);
    router.get('/expedientes/listEmergencia', expedientesController.listEmergencia);
    router.get('/expedientes/listIntensivo', expedientesController.listIntensivo);
    router.get('/expedientes/listHospitalizacion', expedientesController.listHospitalizacion);
    router.get('/expedientes/listReingreso', expedientesController.listReingreso);
    router.put('/expedientes/changeStatus', expedientesController.changeStatus);

    //CARPETA DE ENFERMERIA
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

    //servicioSalaOperaciones
    router.post('/salaOperaciones/created', servicioSalaOperacionesController.create);
    router.get('/salaOperaciones/list', servicioSalaOperacionesController.list);
    router.get('/salaOperaciones/getId/:id', servicioSalaOperacionesController.find);
    router.get('/salaOperaciones/getSearch', servicioSalaOperacionesController.getSearch);

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
    router.get('/comun/list2', comunController.get);
    router.post('/comun/create', comunController.create);
    router.put('/comun/update', comunController.update);
    router.put('/comun/activate', comunController.activate);
    router.put('/comun/deactivate', comunController.deactivate);
    router.get('/comun/getSearch', comunController.getSearch);
    router.get('/comun/getSearchNo', comunController.getSearchNo);

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
    router.get('/medicamentos/list2', medicamentosController.get);
    router.post('/medicamentos/create', medicamentosController.create);
    router.put('/medicamentos/update', medicamentosController.update);
    router.put('/medicamentos/activate', medicamentosController.activate);
    router.put('/medicamentos/deactivate', medicamentosController.deactivate);
    router.get('/medicamentos/getSearch', medicamentosController.getSearch);
    router.get('/medicamentos/getSearchNo', medicamentosController.getSearchNo);

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
    router.get('/quirurgico/getSearchNo', quirurgicoController.getSearchNo);

    //quirurgico_movimientos
    router.get('/quirurgico_movimientos/list', quirurgicoMovimientosController.list);
    router.post('/quirurgico_movimientos/create', quirurgicoMovimientosController.create);
    router.put('/quirurgico_movimientos/update', quirurgicoMovimientosController.update);
    router.put('/quirurgico_movimientos/activate', quirurgicoMovimientosController.activate);
    router.put('/quirurgico_movimientos/deactivate', quirurgicoMovimientosController.deactivate);
    router.get('/quirurgico_movimientos/getSearch', quirurgicoMovimientosController.getSearch);

    //detalle_consumo_medicamentos
    router.post('/detalle_consumo_medicamentos/create', detalle_consumo_medicamentos.create);
    router.get('/detalle_consumo_medicamentos/list/:id', detalle_consumo_medicamentos.get);
    router.get('/detalle_consumo_medicamentos/list', detalle_consumo_medicamentos.list);

    //detalle_consumo_quirurgicos
    router.post('/detalle_consumo_quirugicos/create', detalle_consumo_quirugicos.create);
    router.get('/detalle_consumo_quirugicos/list/:id', detalle_consumo_quirugicos.get);
    router.get('/detalle_consumo_quirugicos/list', detalle_consumo_quirugicos.list);

    //detalle_consumo_comunes
    router.post('/detalle_consumo_comun/create', detalle_consumo_comunes.create);
    router.get('/detalle_consumo_comun/list/:id', detalle_consumo_comunes.get);
    router.get('/detalle_consumo_comun/list', detalle_consumo_comunes.list);

    //CARPETA GERENCIA
    //asuetos
    router.post('/asuetos/create', AsuetosController.create);
    router.get('/asuetos/list', AsuetosController.list);
    router.get('/asuetos/getId/:id', AsuetosController.gitId);
    router.put('/asuetos/:id', AsuetosController.update);

    //CARPETA HONORARIOS
    
    // Rutas para detalle_honorarios
    router.post('/detalle_honorarios/created', detalleHonorariosController.create);
    router.get('/detalle_honorarios', detalleHonorariosController.list);
    router.get('/detalle_honorarios/getId/:id', detalleHonorariosController.find);
    router.get('/detalle_honorarios/getSearch', detalleHonorariosController.getSearch);
    router.put('/detalle_honorarios/:id', detalleHonorariosController.update);

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

    //mantenimientos
    router.get('/mantenimientos/list', mantenimientosController.list);
    router.post('/mantenimientos/create', mantenimientosController.create);
    router.put('/mantenimientos/update', mantenimientosController.update);
    router.put('/mantenimientos/activate', mantenimientosController.activate);
    router.put('/mantenimientos/deactivate', mantenimientosController.deactivate);
    router.get('/mantenimientos/getSearch', mantenimientosController.getSearch);

    //CARPETA DE LIQUIDACIONES

    //CARPETA DE LABORATORIOS
    router.get('/laboratoriosAlmacenados/list', examenesAlmacenadosController.list);
    router.post('/laboratoriosAlmacenados/create', examenesAlmacenadosController.create);
    router.put('/laboratoriosAlmacenados/update', examenesAlmacenadosController.update);
    router.put('/campoLaboratorio/update', campoExamenController.update);
    router.post('/campoLaboratorio/create', campoExamenController.create); 
    router.get('/campoLaboratorio/getByExamen', campoExamenController.getByExamen);
    router.get('/campoLaboratorio/getByExamenId', campoExamenController.getByExamenesId);
    
    //examenes realizados
    router.get('/Examenes_realizados/list', examenesRealizados.list);
    router.get('/Examenes_realizados/list2', examenesRealizados.list2);
    router.get('/Examenes_realizados/list3', examenesRealizados.list3);
    router.get('/Examenes_realizados/listId/:id', examenesRealizados.listCui);
    router.post('/Examenes_realizados/create', examenesRealizados.create);
    router.get('/encargadoExamen/getSearch', examenesRealizados.getsearchEncargado);
    router.get('/examenesAlmacenados/getSearch', examenesRealizados.getsearchExaAlmacenados);
    router.get('/examenesAlmacenadosBuscar/getSearch', examenesRealizados.getsearchExaAlmacenadosBuscar);
    router.put('/Examenes_realizados/update', examenesRealizados.update);

    //Detalle Examen Realizado
    router.get('/detalleExamenRealizado/list', detalleExamenRealizado.list);
    router.post('/detalleExamenRealizado/create', detalleExamenRealizado.create);
    router.get('/TipoExamenAlmacenado/getSearch', detalleExamenRealizado.getsearchTipo);
    router.get('/detalleExamenRealizado/get', detalleExamenRealizado.get);

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

    //voucherPagoHonorarios
    router.post('/voucher/create', voucherHonorariosController.create);
    router.get('/voucher/getSearch', voucherHonorariosController.getSearch);

    //CARPETA DE PACIENTES
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

    //CARPETA DE EMPLEADOS
    
    //encargados
    router.get('/encargados/list', encargadosController.list);
    router.post('/encargados/create', encargadosController.create);
    router.put('/encargados/update', encargadosController.update);
    router.put('/encargados/activate', encargadosController.activate);
    router.put('/encargados/deactivate', encargadosController.deactivate);
    router.get('/encargados/getSearch', encargadosController.getSearch);
    router.get('/encargados/get', encargadosController.get);

    //tipos de encargados
    router.get('/tipos_encargados/get', tipoEncargadoController.get);

    //tipos de examenes
    router.get('/tipos_examenes/list', tipoExamenController.list);
    router.post('/tipos_examenes/create', tipoExamenController.create);
    router.put('/tipos_examenes/update', tipoExamenController.update);
    router.put('/tipos_examenes/activate', tipoExamenController.activate);
    router.put('/tipos_examenes/deactivate', tipoExamenController.deactivate);
    router.get('/tipos_examenes/getSearch', tipoExamenController.getSearch);
    router.get('/tipos_examenes/get', tipoExamenController.get);

    // CARPETA DE CUENTAS DE LABORATORIO
    //cuentas
    router.get('/lab_cuentas/list', labCuentasController.list);
    router.get('/lab_cuentas/debtList', labCuentasController.listNoPay);
    router.get('/lab_cuentas/payList', labCuentasController.listPay);
    router.get('/lab_cuentas/get', labCuentasController.get);
    router.get('/lab_cuentas/getByExp', labCuentasController.getByExp);
    router.get('/lab_cuentas/pay', labCuentasController.onPay);
    router.post('/lab_cuentas/create', labCuentasController.create);
    router.put('/lab_cuentas/update', labCuentasController.update);
    router.put('/lab_cuentas/activate', labCuentasController.activate);
    router.put('/lab_cuentas/deactivate', labCuentasController.deactivate);
    router.get('/lab_cuentas/getSearch', labCuentasController.getSearch);
    router.post('/lab_cuentas/requestDiscount', labCuentasController.DiscountRequest);
    router.get('/lab_cuentas/listDiscount', labCuentasController.listNoPayDiscountRequest);
    
    //Seguros laboratorios
    //router.post('/seguros/create', labPagoSegurosController.create);
    //router.get('/seguros/list', labPagoSegurosController.list);
    router.get('/lab_seguros/debtList', labPagoSegurosController.listAssuranceNoPay);
    //router.put('/seguros/deactivate', labPagoSegurosController.deactivate);
    //router.put('/seguros/paid', labPagoSegurosController.paid);
    //router.put('/seguros/debt', labPagoSegurosController.debt);
    //router.get('/seguros/getByExp', labPagoSegurosController.getAssuranceByExp);


    //dealle cuentas
    router.get('/detalle/getByAccount', labDetalleCuentasController.getByAccount);
    router.get('/detalle/listCortesPerDate', labDetalleCuentasController.listCortesPerDate);

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

    // CARPETA DE REPORTES
    //reportes de caja de hospital
    router.get('/reporte/ingresosFechas', reportesCajaHospiController.ingresosFechas)
    router.get('/reporte/ingresosDia', reportesCajaHospiController.ingresosDia)
    router.get('/reporte/detalleMediosDePago', reportesCajaHospiController.detalleMediosDePagoMesActual)
    router.get('/reporte/simpleMediosDePago', reportesCajaHospiController.simpleMediosDePago)
    router.get('/reporte/mediosPagoPaciente', reportesCajaHospiController.mediosPagoPorPaciente)
    //router.get('/reporte/detalleMediosDePago', reportesCajaHospiController.detalleMediosDePagoMesActual)
    //router.get('/reporte/simpleMediosDePago', reportesCajaHospiController.simpleMediosDePago)

    //reportes de farmacia
    router.get('/reporte/farmacia/productosMasUtilizados', reportesFarmaciaController.getProductosMasUtilizados)
    router.get('/reporte/farmacia/proveedores', reportesFarmaciaController.getProveedoresMasSolicitados)
    router.get('/reporte/farmacia/inventarioMedicina', reportesFarmaciaController.getInventarioMedicinas)
    router.get('/reporte/farmacia/iventarioGeneral', reportesFarmaciaController.getInventarioGeneral)
    router.get('/reporte/farmacia/suministroMedicamentos', reportesFarmaciaController.getMedicametosSuministrados)

    //reportes de enfermeria
    router.get('/reporte/enfermeria/pacientesLugar', reportesEnfermeriaController.getPacientesPorLugar)
    router.get('/reporte/enfermeria/pacientesActuales', reportesEnfermeriaController.getPacientesActuales)
    router.get('/reporte/enfermeria/pacientesTodos', reportesEnfermeriaController.getTodosPacientesPorFechas)
    router.get('/reporte/enfermeria/serviciosMasConsumidos', reportesEnfermeriaController.getServiciosMasConsumidos)
    router.get('/reporte/enfermeria/medicamentos', reportesEnfermeriaController.getMedicamentosMasConsumidos)
    router.get('/reporte/enfermeria/fallecidos', reportesEnfermeriaController.getPacientesFallecidos)
    router.get('/reporte/enfermeria/egresados', reportesEnfermeriaController.getPacientesEgresados)

    //reportes de Medicos
    router.get('/reporte/medicos/honorarios', reportesMedicosController.reporteHonorarios)
    router.get('/reporte/medicos/medicoMasHonorarios', reportesMedicosController.reporteMedicoMasHonorarios)
    router.get('/reporte/medicos/optenerPacientes', voucherHonorariosController.getPacientesHonorarios)

    //reportes de Laboratorio
    router.get('/reporte/laboratio/examenesGeneral', reportesExamenesController.getReporteGeneralExamenes)
    router.get('/reporte/laboratio/MasMenosRealizados', reportesExamenesController.getReporteExamenesMasMenosRealizados)
    router.get('/reporte/laboratio/examenesDiarios', reportesExamenesController.getReporteExamenesDiarios)
    router.get('/reporte/laboratio/porMedico', reportesExamenesController.getReporteExamenesPorMedico)
    router.get('/reporte/laboratio/comisiones', reportesExamenesController.getAllExamenesPorMedico)

    //AUTH
    router.post('/login', authController.login);
    router.post('/refresh', authController.refresh);
    router.post('/logout', authController.logout);
    router.post('/autenticar', auth, authController.autenticar);
    router.post('/validatePassword', authController.validatePassword);

    app.use('/', router);
};