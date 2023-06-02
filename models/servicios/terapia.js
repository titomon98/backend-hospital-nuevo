'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class terapia extends Model {
    
  };
  terapia.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio: {
        type: DataTypes.STRING,
        allowNull: false
      },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'terapias',
  });
  return terapia;
};