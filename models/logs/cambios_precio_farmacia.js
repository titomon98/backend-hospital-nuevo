'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class logs extends Model {
    static associate(models) {

    }
  };
  logs.init({
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    accion: {
        type: DataTypes.STRING,
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
    modelName: 'cambios_precios_farmacias',
  });
  return logs;
};