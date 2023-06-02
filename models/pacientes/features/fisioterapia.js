'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class fisioterapia extends Model {
    static associate(models) {
      fisioterapia.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
      fisioterapia.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
    }
  };
  fisioterapia.init({
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
    modelName: 'fisioterapias',
  });
  return fisioterapia;
};