'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class medicos extends Model {
    static associate(models) {
      medicos.belongsTo(models.especialidades, {
        foreignKey: "id_especialidad",
      });
      medicos.hasMany(models.socios, {
        foreignKey: "id_medico",
      });
      medicos.hasMany(models.recetas, {
        foreignKey: "id_medico",
      });
      medicos.hasMany(models.expedientes, {
        foreignKey: "id_medico",
      });
    }
  };
  medicos.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nit: {
        type: DataTypes.STRING,
      },
      telefono: {
        type: DataTypes.STRING,
        allowNull: false
      },
      correo: {
        type: DataTypes.STRING,
      },
      observaciones: {
        type: DataTypes.TEXT,
      },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_especialidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
  }, {
    sequelize,
    modelName: 'medicos',
  });
  return medicos;
};