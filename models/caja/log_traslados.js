'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class logs extends Model {
    static associate(models) {
      logs.belongsTo(models.expedientes, {
        foreignKey: "id_expediente",
      });
    }
  };
  logs.init({
    origen: {
      type: DataTypes.STRING,
      allowNull: false
    },
    destino: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    motivo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    id_habitacionDestino : {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_by: {
      type: DataTypes.STRING,
    },
    updated_by: {
      type: DataTypes.STRING,
    },
    id_expediente : {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    modelName: 'log_traslados',
  });
  return logs;
};