'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  // Venta libre: exactamente uno de id_expediente / id_usuario / id_medico / id_cliente.
  // estado: 1 = por cobrar, 2 = cobrada, 0 = anulada.
  class venta_libre_cuentas extends Model {
    static associate(models) {
      venta_libre_cuentas.hasMany(models.venta_libre_detalles, { foreignKey: 'id_venta_libre', as: 'detalles' });
      venta_libre_cuentas.belongsTo(models.expedientes, { foreignKey: 'id_expediente', as: 'expediente' });
      venta_libre_cuentas.belongsTo(models.usuarios, { foreignKey: 'id_usuario', as: 'usuario' });
      venta_libre_cuentas.belongsTo(models.medicos, { foreignKey: 'id_medico', as: 'medico' });
      venta_libre_cuentas.belongsTo(models.venta_libre_clientes, { foreignKey: 'id_cliente', as: 'cliente' });
    }
  }
  const dinero = () => ({ type: DataTypes.DECIMAL(10, 2) }); // objeto nuevo por columna: Sequelize lo muta
  venta_libre_cuentas.init({
    id_expediente: { type: DataTypes.INTEGER },
    id_usuario: { type: DataTypes.INTEGER },
    id_medico: { type: DataTypes.INTEGER },
    id_cliente: { type: DataTypes.INTEGER },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    estado: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    efectivo: dinero(),
    tarjeta: dinero(),
    deposito: dinero(),
    cheque: dinero(),
    transferencia: dinero(),
    fecha_cobro: { type: DataTypes.DATE },
    cobrado_by: { type: DataTypes.STRING },
    created_by: { type: DataTypes.STRING },
    updated_by: { type: DataTypes.STRING }
  }, {
    sequelize,
    modelName: 'venta_libre_cuentas',
    tableName: 'venta_libre_cuentas'
  });
  return venta_libre_cuentas;
};
