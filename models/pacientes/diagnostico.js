'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class diagnostico extends Model {
    static associate(models) {
      diagnostico.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
      diagnostico.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
    }
  };
  diagnostico.init({
    tipo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado_diagnostico: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fecha_inicio: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    notas: {
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
    modelName: 'diagnosticos',
  });
  return diagnostico;
};