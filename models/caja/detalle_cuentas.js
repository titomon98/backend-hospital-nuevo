'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detalle_cuenta extends Model {
    static associate(models) {
        detalle_cuenta.belongsTo(models.cuentas, {
            foreignKey: "id_cuenta",
        });
    }
  };
  detalle_cuenta.init({
    tipo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    id_externo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
      }
  }, {
    sequelize,
    modelName: 'detalle_cuentas',
  });
  return detalle_cuenta;
};