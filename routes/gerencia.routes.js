// CARPETA DE GERENCIA
const AsuetosController = require('../controllers/gerencia/asuetosController')

module.exports = (router) => {
    //asuetos
    router.post('/asuetos/create', AsuetosController.create);
    router.get('/asuetos/list', AsuetosController.list);
    router.get('/asuetos/getId/:id', AsuetosController.gitId);
    router.put('/asuetos/:id', AsuetosController.update);
}
