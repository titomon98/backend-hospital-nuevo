'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class seguro extends Model {
    static associate(models) {
      seguro.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
      seguro.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
    }
  };
  seguro.init({
    activo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    prioridad: {
        type: DataTypes.STRING,
        allowNull: false
      },
      seguro: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      valido_hasta: {
        type: DataTypes.DATEONLY,
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
    modelName: 'seguros',
  });
  return seguro;
};