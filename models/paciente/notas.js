'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class nota extends Model {
    static associate(models) {
      nota.belongsTo(models.expedientes, {
        foreignKey: "id_expediente",
      });
      nota.belongsTo(models.medicos, {
        foreignKey: "id_medico",
      });
    }
  };
  nota.init({
    contenido: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_expediente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_medico: {
      type: DataTypes.INTEGER,
    },
    created_by: {
        type: DataTypes.STRING,
      },
      updated_by: {
        type: DataTypes.STRING,
      },
  }, {
    sequelize,
    modelName: 'notas',
  });
  return nota;
};