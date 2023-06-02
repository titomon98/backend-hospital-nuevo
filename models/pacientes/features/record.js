'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class record extends Model {
    static associate(models) {
      record.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
      record.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
      record.hasMany(models.record_logs, {
        foreignKey: "id_record",
      });
    }
  };
  record.init({
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false
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
    modelName: 'records',
  });
  return record;
};