'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class orden extends Model {
    static associate(models) {
      orden.belongsTo(models.pacientes, {
        foreignKey: "id_paciente",
      });
      orden.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
      orden.belongsTo(models.equipos,{
        foreignKey: "id_equipo",
      })
      orden.hasMany(models.resultados,{
        foreignKey: "id_orden",
      })
      orden.belongsTo(models.medicos,{
        foreignKey: "id_medico",
      })
    }
  };
  orden.init({
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
      allowNull: false
    },
    referido: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sedacion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    estado_sedacion: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_paciente: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_equipo: {
      type: DataTypes.INTEGER,
    },
    id_medico: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    modelName: 'ordenes',
  });
  return orden;
};