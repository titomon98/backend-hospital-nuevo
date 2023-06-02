'use strict';
var Sequelize = require("sequelize");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class idioma extends Model {
    static associate(models) {
      idioma.hasMany(models.pacientes, {
        foreignKey: "id_idioma",
        as: 'idiomas',
      });
    }
  };
  idioma.init({
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
    modelName: 'idiomas',
  });
  return idioma;
};