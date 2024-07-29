'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class lab_pago_seguros extends Model {
    static associate(models) {
        lab_pago_seguros.belongsTo(models.lab_detalle_pago_cuentas, {
            foreignKey: "id_lab_detalle_pago_cuenta",
        });
        lab_pago_seguros.belongsTo(models.seguros, {
            foreignKey: "id_seguro",
        });
    }
  };
  lab_pago_seguros.init({
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
    modelName: 'lab_pago_seguros',
  });
  return lab_pago_seguros;
};