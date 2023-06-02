'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class lenguaje extends Model {
    static associate(models) {
      lenguaje.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
      lenguaje.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
    }
  };
  lenguaje.init({
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
    modelName: 'lenguajes',
  });
  return lenguaje;
};