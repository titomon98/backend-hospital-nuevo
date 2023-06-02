'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class psicologia extends Model {
    static associate(models) {
      psicologia.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
      psicologia.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
    }
  };
  psicologia.init({
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
    modelName: 'psicologias',
  });
  return psicologia;
};