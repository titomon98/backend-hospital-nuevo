'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class centro extends Model {
    static associate(models) {
      centro.hasMany(models.clinicas, {
        foreignKey: "id_centro",
      });
    }
  };
  centro.init({
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
    modelName: 'centros',
  });
  return centro;
};