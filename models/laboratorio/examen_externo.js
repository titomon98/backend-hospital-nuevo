'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class examen_externos extends Model {
    static associate(models) {
        examen_externos.belongsTo(models.tipo_examenes, {
        foreignKey: "id_tipo_examen",
      });
    }
  };
  examen_externos.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_tipo_examen: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'examen_externos',
  });
  return examen_externos;
};