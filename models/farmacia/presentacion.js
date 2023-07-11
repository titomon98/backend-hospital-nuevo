'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class presentaciones extends Model {
    static associate(models) {
      presentaciones.hasMany(models.medicamentos, {
        foreignKey: "id_presentacion",
      });
      presentaciones.hasMany(models.muestras_medicas, {
        foreignKey: "id_presentacion",
      });
      presentaciones.hasMany(models.comunes, {
        foreignKey: "id_presentacion",
      });
      presentaciones.hasMany(models.quirurgicos, {
        foreignKey: "id_presentacion",
      });
    }
  };
  presentaciones.init({
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
    modelName: 'presentaciones',
  });
  return presentaciones;
};