'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class genetica extends Model {
    
  };
  genetica.init({
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
    modelName: 'geneticas',
  });
  return genetica;
};