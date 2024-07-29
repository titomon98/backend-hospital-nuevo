'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class lab_detalle_pago_cuenta extends Model {
    static associate(models) {
        lab_detalle_pago_cuenta.belongsTo(models.labCuentas, {
            foreignKey: "id_Lab_cuenta",
        });
    }
  };
  lab_detalle_pago_cuenta.init({
    efectivo: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    tarjeta: {
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
    id_lab_cuenta: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
  }, {
    sequelize,
    modelName: 'lab_detalle_pago_cuentas',
  });
  return lab_detalle_pago_cuenta;
};