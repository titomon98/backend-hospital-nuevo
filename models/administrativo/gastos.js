'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class gastos extends Model {
    
  };
  gastos.init({
    servicio: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cantidad: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'gastos',
  });
  return gastos;
};