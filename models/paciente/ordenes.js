'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class orden extends Model {
    static associate(models) {
      orden.belongsTo(models.expedientes, {
        foreignKey: "id_expediente",
      });
      orden.belongsTo(models.medicos, {
        foreignKey: "id_medico",
      });
    }
  };
  orden.init({
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
    modelName: 'ordenes',
  });
  return orden;
};