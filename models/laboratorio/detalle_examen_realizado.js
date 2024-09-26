'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class detalle_examen_realizado extends Model {
    static associate(models) {
      detalle_examen_realizado.belongsTo(models.examenes_realizados, {
        foreignKey: "id_examen_realizado",
      }); 
    }
  };
  detalle_examen_realizado.init({
    id_examen_realizado: {
      type: DataTypes.STRING,
      allowNull: false
    },
    id_campo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_tipo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    resultado: {
      type: DataTypes.STRING,
      allowNull: true
    },
    alarma: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'detalle_examen_realizado',
  });
  return detalle_examen_realizado;
};