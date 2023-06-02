'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class radiologia extends Model {
    static associate(models) {
      radiologia.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
      radiologia.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
    }
  };
  radiologia.init({
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
    modelName: 'radiologias',
  });
  return radiologia;
};