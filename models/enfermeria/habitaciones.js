'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class habitaciones extends Model {
    static associate(models) {
      habitaciones.belongsTo(models.expedientes, {
        foreignKey: "ocupante",
      });
    }
  };
  habitaciones.init({
    numero: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    costo_ambulatorio: {
        type: DataTypes.STRING,
        allowNull: false
    },
    costo_diario: {
        type: DataTypes.STRING,
        allowNull: false
    },
    costo_estudio_de_sueno: {
      type: DataTypes.STRING,
        allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ocupante: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_by: {
      type: DataTypes.STRING,
    },
    updated_by: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'habitaciones',
  });
  return habitaciones;
};