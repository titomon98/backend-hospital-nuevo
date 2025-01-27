'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tipo_examenes extends Model {
    static associate(models) {
    }
  };
  tipo_examenes.init({
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
    modelName: 'tipo_examenes',
  });
  return tipo_examenes;
};