'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tipo_medicamento extends Model {
    static associate(models) {
      tipo_medicamento.hasMany(models.medicamentos, {
        foreignKey: "id_tipo_medicamento",
      });
      tipo_medicamento.hasMany(models.medicamento_externos, {
        foreignKey: "id_tipo_medicamento",
      });
    }
  };
  tipo_medicamento.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'tipo_medicamentos',
  });
  return tipo_medicamento;
};