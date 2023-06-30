'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class socios extends Model {
    static associate(models) {
      socios.belongsTo(models.medicos, {
        foreignKey: "id_medico",
      });
    }
  };
  socios.init({
    acciones: {
      type: DataTypes.STRING,
      allowNull: false
    },
    inicio: {
        type: DataTypes.STRING,
        allowNull: false
      },
      final: {
        type: DataTypes.STRING,
        allowNull: false
      },
      observaciones: {
        type: DataTypes.STRING,
      },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_medico: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
  }, {
    sequelize,
    modelName: 'socios',
  });
  return socios;
};