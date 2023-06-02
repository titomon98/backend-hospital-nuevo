'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class presentacion extends Model {
    static associate(models) {
      presentacion.hasMany(models.medicamentos, {
        foreignKey: "id_presentacion",
      });
      presentacion.hasMany(models.medicamentos, {
        foreignKey: "id_presentacion",
      });
    }
  };
  presentacion.init({
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
  return presentacion;
};