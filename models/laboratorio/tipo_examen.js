'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tipo_examen extends Model {
    static associate(models) {
      tipo_examen.hasMany(models.examenes, {
        foreignKey: "id_tipo_examen",
      });
      tipo_examen.hasMany(models.examen_externos, {
        foreignKey: "id_tipo_examen",
      });
    }
  };
  tipo_examen.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'tipo_examenes',
  });
  return tipo_examen;
};