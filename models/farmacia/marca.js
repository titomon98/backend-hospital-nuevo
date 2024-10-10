'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class marcas extends Model {
    static associate(models) {
      marcas.hasMany(models.medicamentos, {
        foreignKey: "id_marca",
      });
      marcas.hasMany(models.muestras_medicas, {
        foreignKey: "id_marca",
      });
      marcas.hasMany(models.comunes, {
        foreignKey: "id_marca",
      });
      marcas.hasMany(models.quirurgicos, {
        foreignKey: "id_marca",
      });
    }
  };
  marcas.init({
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
    modelName: 'marcas',
  });
  return marcas;
};