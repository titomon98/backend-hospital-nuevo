'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  // Linea de venta libre. tipo: medicamento | anestesico | quirurgico | comun | servicio.
  // inventariado = se desconto de existencia_actual_farmacia (se devuelve al anular/editar).
  class venta_libre_detalles extends Model {
    static associate(models) {
      venta_libre_detalles.belongsTo(models.venta_libre_cuentas, { foreignKey: 'id_venta_libre' });
    }
  }
  venta_libre_detalles.init({
    id_venta_libre: { type: DataTypes.INTEGER, allowNull: false },
    tipo: { type: DataTypes.STRING(20), allowNull: false },
    id_item: { type: DataTypes.INTEGER, allowNull: false },
    descripcion: { type: DataTypes.STRING, allowNull: false },
    cantidad: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    inventariado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_by: { type: DataTypes.STRING },
    updated_by: { type: DataTypes.STRING }
  }, {
    sequelize,
    modelName: 'venta_libre_detalles',
    tableName: 'venta_libre_detalles'
  });
  return venta_libre_detalles;
};
