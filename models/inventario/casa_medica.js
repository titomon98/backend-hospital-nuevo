'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class casa_medica extends Model {
    static associate(models) {
      casa_medica.hasMany(models.marcas, {
        foreignKey: "id_casa_medica",
      });
    }
  };
  casa_medica.init({
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
    modelName: 'casa_medicas',
  });
  return casa_medica;
};