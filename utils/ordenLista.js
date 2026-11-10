// criterio/order de vuetable -> order de Sequelize. Solo columnas permitidas;
// 'expediente.nombres' / 'expediente.apellidos' ordenan por el include del expediente.
function ordenDe(criterio, order, Expediente, permitidos) {
    const dir = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const [campo, sub] = String(criterio || '').split('.');
    if (campo === 'expediente' && ['nombres', 'apellidos'].includes(sub)) return [[Expediente, sub, dir]];
    if (!sub && permitidos.includes(campo)) return [[campo, dir]];
    return [['createdAt', dir]];
}

module.exports = { ordenDe };
