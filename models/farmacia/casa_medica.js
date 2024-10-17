'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class casa_medicas extends Model {
    static associate(models) {
      casa_medicas.hasMany(models.muestras_medicas, {
        foreignKey: "id_muestra",
      });
    }
  };
  casa_medicas.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_by: {
      type: DataTypes.STRING,
    },
    updated_by: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'casa_medicas',
  });
  return casa_medicas;
};