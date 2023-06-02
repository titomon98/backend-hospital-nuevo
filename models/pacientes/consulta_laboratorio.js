'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class consulta_laboratorios extends Model {
    static associate(models) {
      consulta_laboratorios.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
      consulta_laboratorios.belongsTo(models.examenes, {
        foreignKey: "id_examen",
      });
    }
  };
  consulta_laboratorios.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    start: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hora_entrada: {
      type: DataTypes.DATE,
      allowNull: true
    },
    referido: {
      type: DataTypes.STRING,
      allowNull: true
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado_consulta: { //1 a tiempo, 2 atrasada, 3 cancelada
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_paciente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_examen: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'consulta_laboratorios',
  });
  return consulta_laboratorios;
};