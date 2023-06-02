'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class receta extends Model {
    static associate(models) {
      receta.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
      receta.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
    }
  };
  receta.init({
    medicamento: {
      type: DataTypes.STRING,
      allowNull: false
    },
    via: {
        type: DataTypes.STRING,
      },
      frecuencia: {
        type: DataTypes.STRING,
      },
      tipo: {
        type: DataTypes.STRING,
      },
      farmacia: {
        type: DataTypes.STRING,
      },
      iniciar: {
        type: DataTypes.STRING,
      },
      ultima_toma: {
        type: DataTypes.STRING,
      },
      observaciones: {
        type: DataTypes.STRING,
      },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_paciente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
  }, {
    sequelize,
    modelName: 'recetas',
  });
  return receta;
};