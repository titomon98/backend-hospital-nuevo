'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pago_seguros extends Model {
    static associate(models) {
        pago_seguros.belongsTo(models.detalle_pago_cuentas, {
            foreignKey: "id_detalle_pago_cuenta",
        });
        pago_seguros.belongsTo(models.seguros, {
            foreignKey: "id_seguro",
        });
    }
  };
  pago_seguros.init({
    total: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
      },
    pagado: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
      },
    por_pagar: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
      }
  }, {
    sequelize,
    modelName: 'pago_seguros',
  });
  return pago_seguros;
};