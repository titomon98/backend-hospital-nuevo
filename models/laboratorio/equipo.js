'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class equipo extends Model {
    static associate(models) {
      equipo.belongsTo(models.examenes, {
        foreignKey: "id_examen",
      });
      equipo.hasMany(models.ordenes,{
        foreignKey: "id_equipo",
      })
    }
  };
  equipo.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tiempo_uso: {
      type: DataTypes.STRING,
      allowNull: false
    },
    adquisicion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mantenimiento_previo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mantenimiento_siguiente: {
      type: DataTypes.STRING,
      allowNull: false
    },
    preparacion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_examen: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'equipos',
  });
  return equipo;
};