'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detalle_pago_cuenta extends Model {
    static associate(models) {
        detalle_pago_cuenta.belongsTo(models.cuentas, {
            foreignKey: "id_cuenta",
        });
    }
  };
  detalle_pago_cuenta.init({
    efectivo: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    tarjeta: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: true
    },
    recargoTarjeta: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: true
    },
    deposito: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: true
    },
    cheque: {
        type: DataTypes.DECIMAL(10,2),
    },
    seguro: {
        type: DataTypes.DECIMAL(10,2),
    },
    transferencia: {
      type: DataTypes.DECIMAL(10,2),
    },
    total: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: true
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    id_cuenta: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
  }, {
    sequelize,
    modelName: 'detalle_pago_cuentas',
  });
  return detalle_pago_cuenta;
};