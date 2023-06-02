'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tipo_sangre extends Model {
    static associate(models) {
      tipo_sangre.hasMany(models.pacientes, {
        foreignKey: "id_tipo_sangre",
        as: 'tipo_sangres',
      });
    }
  };
  tipo_sangre.init({
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
    modelName: 'tipo_sangres',
  });
  return tipo_sangre;
};