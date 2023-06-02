'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class cargo extends Model {
    static associate(models) {
      cargo.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
      cargo.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
    }
  };
  cargo.init({
    contenido: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cantidad: {
      type: DataTypes.STRING,
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
    modelName: 'cargos',
  });
  return cargo;
};