'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class especialidades extends Model {
    static associate(models) {
      especialidades.hasMany(models.medicos, {
        foreignKey: "id_especialidad",
      });
    }
  };
  especialidades.init({
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
    modelName: 'especialidades',
  });
  return especialidades;
};