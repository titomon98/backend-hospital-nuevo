'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class consulta extends Model {
    static associate(models) {
      consulta.belongsTo(models.medicos, {
        foreignKey: "id_medico",
      });
      consulta.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
    }
  };
  consulta.init({
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
    id_medico: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'consultas',
  });
  return consulta;
};