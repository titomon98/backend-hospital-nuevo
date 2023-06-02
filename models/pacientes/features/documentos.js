'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class documento extends Model {
    static associate(models) {
      documento.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
      documento.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
    }
  };
  documento.init({
    contenido: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nombre: {
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
    modelName: 'documentos',
  });
  return documento;
};