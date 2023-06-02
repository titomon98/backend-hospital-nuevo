'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tienda extends Model {
    
  };
  tienda.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    direccion: {
        type: DataTypes.STRING,
        allowNull: false
      },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'tiendas',
  });
  return tienda;
};