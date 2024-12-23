'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class log_traslados extends Model {
    static associate(models) {
      log_traslados.belongsTo(models.expedientes, {
        foreignKey: "id_expediente",
      });
    }
  };
  log_traslados.init({
    origen: {
      type: DataTypes.STRING,
      allowNull: false
    },
    destino: {
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
    modelName: 'log_traslados',
  });
  return log_traslados;
};