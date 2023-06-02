'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class arrendamiento extends Model {
    static associate(models) {
      arrendamiento.belongsTo(models.clinicas, {
        foreignKey: "id_clinica",
      });
      arrendamiento.belongsTo(models.medicos, {
        foreignKey: "id_medico",
      });
    }
  };
  arrendamiento.init({
    inicio: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fin: {
      type: DataTypes.DATE,
      allowNull: false
    },
    costo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_clinica: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_medico: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'arrendamientos',
  });
  return arrendamiento;
};