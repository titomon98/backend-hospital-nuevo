'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class labCuenta extends Model {
    static associate(models) {
      labCuenta.belongsTo(models.expedientes, {
            foreignKey: "id_expediente",
        });
    }
  };
  labCuenta.init({
    numero: {
      type: DataTypes.STRING,
      allowNull: false
    },
    total: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total_pagado: {
      type: DataTypes.DECIMAL,
      defaultValue: 0
    },
    pendiente_de_pago: {
      type: DataTypes.DECIMAL,
      defaultValue: 0
    },
    id_expediente: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
  }, {
    sequelize,
    modelName: 'lab_cuentas',
  });
  return labCuenta;
};