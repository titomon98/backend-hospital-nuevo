'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pago extends Model {
    static associate(models) {
      pago.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
      pago.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
    }
  };
  pago.init({
    fecha_pago: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipo_pago: {
      type: DataTypes.STRING,
      allowNull: false
    },
    referencia: {
      type: DataTypes.STRING,
    },
    saldo_actual: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cantidad_pagada: {
      type: DataTypes.STRING,
      allowNull: false
    },
    balance_restante: {
      type: DataTypes.STRING,
      allowNull: false
    },
    notas: {
      type: DataTypes.STRING,
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_paciente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
  }
  }, {
    sequelize,
    modelName: 'pagos',
  });
  return pago;
};