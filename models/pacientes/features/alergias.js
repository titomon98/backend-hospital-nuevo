'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class alergia extends Model {
    static associate(models) {
      alergia.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
      alergia.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
    }
  };
  alergia.init({
    alergeno: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gravedad: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha_identificada: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nota: {
        type: DataTypes.STRING,
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
    modelName: 'alergias',
  });
  return alergia;
};