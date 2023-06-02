'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class especialidad extends Model {
    static associate(models) {
      especialidad.hasMany(models.medicos, {
        foreignKey: "id_especialidad",
      });
    }
  };
  especialidad.init({
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
    modelName: 'especialidades',
  });
  return especialidad;
};